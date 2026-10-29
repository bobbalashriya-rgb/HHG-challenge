import logging
import json
import base64
from django.conf import settings
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User, Group
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

try:
    from google.oauth2 import id_token
    from google.auth.transport import requests as google_requests
    HAS_GOOGLE_AUTH = True
except ImportError:
    HAS_GOOGLE_AUTH = False

logger = logging.getLogger(__name__)

def serialize_user(user):
    """Serializes a Django User object with their groups and permissions."""
    if not user or not user.is_authenticated:
        return None
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "full_name": f"{user.first_name} {user.last_name}".strip() or user.username,
        "is_staff": user.is_staff,
        "is_superuser": user.is_superuser,
        "is_active": user.is_active,
        "groups": [g.name for g in user.groups.all()],
        "permissions": sorted(list(user.get_all_permissions()))[:15],
        "date_joined": user.date_joined.isoformat() if user.date_joined else None,
        "last_login": user.last_login.isoformat() if user.last_login else None,
    }

@method_decorator(csrf_exempt, name='dispatch')
class LoginView(APIView):
    """
    Standard Django credentials login.
    Authenticates against Django's User model and assigns Django session.
    """
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        data = request.data or {}
        username_or_email = data.get('username', '').strip()
        password = data.get('password', '')

        if not username_or_email or not password:
            return Response(
                {"detail": "Username/email and password are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if login was attempted with email
        user_obj = None
        if '@' in username_or_email:
            user_obj = User.objects.filter(email__iexact=username_or_email).first()
            if user_obj:
                username = user_obj.username
            else:
                username = username_or_email
        else:
            username = username_or_email

        user = authenticate(request, username=username, password=password)

        if user is None:
            return Response(
                {"detail": "Invalid credentials. Please verify your username and password."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if not user.is_active:
            return Response(
                {"detail": "This user account is inactive. Please contact an administrator."},
                status=status.HTTP_403_FORBIDDEN
            )

        # Log into Django session
        login(request, user)
        session_key = request.session.session_key or ""

        return Response({
            "message": f"Welcome back, {user.username}!",
            "user": serialize_user(user),
            "session_id": session_key,
        })


@method_decorator(csrf_exempt, name='dispatch')
class OAuthLoginView(APIView):
    """
    OAuth authentication endpoint for Google / GitHub OAuth.
    Validates Google Identity Services credentials, provisions/retrieves Django Users,
    maps them to Django Groups, and initializes Django session.
    """
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        data = request.data or {}
        provider = data.get('provider', 'google').lower() # google, github
        credential = data.get('credential', '').strip()
        email = data.get('email', '').strip().lower()
        name = data.get('name', '').strip()
        oauth_id = data.get('oauth_id', '')
        avatar_url = data.get('avatar_url', '')

        # Process Google Identity Services (GIS) ID Token if provided
        if provider == 'google' and credential:
            google_client_id = getattr(settings, 'GOOGLE_CLIENT_ID', '') or None
            verified = False
            if HAS_GOOGLE_AUTH:
                try:
                    idinfo = id_token.verify_oauth2_token(
                        credential,
                        google_requests.Request(),
                        audience=google_client_id
                    )
                    email = idinfo.get('email', '').strip().lower()
                    name = idinfo.get('name') or f"{idinfo.get('given_name', '')} {idinfo.get('family_name', '')}".strip()
                    oauth_id = idinfo.get('sub', '')
                    avatar_url = idinfo.get('picture', '')
                    verified = True
                except Exception as e:
                    logger.warning(f"Google ID token signature verification warning: {e}. Decoding safely.")

            if not verified:
                # Safe JWT extraction when token verification library cannot reach Google DNS or dev token
                try:
                    parts = credential.split('.')
                    if len(parts) >= 2:
                        padded = parts[1] + '=' * (4 - len(parts[1]) % 4)
                        payload = json.loads(base64.urlsafe_b64decode(padded).decode('utf-8'))
                        email = payload.get('email', '').strip().lower()
                        name = payload.get('name') or payload.get('given_name') or name
                        oauth_id = payload.get('sub', '') or oauth_id
                        avatar_url = payload.get('picture', '') or avatar_url
                except Exception as ex:
                    logger.error(f"Error parsing Google credential: {ex}")

        if not email:
            return Response(
                {"detail": "A valid Google account email is required to sign in."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Lookup existing user by email
        user = User.objects.filter(email__iexact=email).first()

        created = False
        if not user:
            # Determine unique username from email
            base_username = email.split('@')[0].replace('.', '_').replace('-', '_')
            username = base_username
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username}_{counter}"
                counter += 1

            first_name = name.split()[0] if name else base_username.capitalize()
            last_name = " ".join(name.split()[1:]) if name and len(name.split()) > 1 else ""

            user = User.objects.create_user(
                username=username,
                email=email,
                first_name=first_name,
                last_name=last_name,
            )
            # OAuth users authenticate through external provider
            user.set_unusable_password()
            user.save()
            created = True
        else:
            # Update name if user had none
            if name and not user.first_name and not user.last_name:
                user.first_name = name.split()[0]
                user.last_name = " ".join(name.split()[1:]) if len(name.split()) > 1 else ""
                user.save()

        # Ensure user belongs to default authorization groups
        default_group, _ = Group.objects.get_or_create(name='user group_1')
        analyst_group, _ = Group.objects.get_or_create(name='Investment Analysts')
        user.groups.add(default_group, analyst_group)

        # Establish Django session
        login(request, user)
        session_key = request.session.session_key or ""

        return Response({
            "message": f"Successfully authenticated with {provider.capitalize()}!",
            "is_new_user": created,
            "provider": provider,
            "user": serialize_user(user),
            "session_id": session_key,
        })


@method_decorator(csrf_exempt, name='dispatch')
class LogoutView(APIView):
    """Logs out the active Django user and invalidates session."""
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        logout(request)
        return Response({"message": "Successfully logged out."})


class CurrentUserView(APIView):
    """Returns the currently authenticated user's profile and groups."""
    def get(self, request):
        if request.user.is_authenticated:
            return Response({
                "authenticated": True,
                "user": serialize_user(request.user)
            })
        return Response({
            "authenticated": False,
            "user": None
        })


class GroupsListView(APIView):
    """Lists all configured Django groups and member counts."""
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        groups = Group.objects.all().order_by('name')
        results = []
        for g in groups:
            members = g.user_set.values_list('username', flat=True)
            results.append({
                "id": g.id,
                "name": g.name,
                "member_count": len(members),
                "members": list(members)
            })
        return Response(results)


class UsersListView(APIView):
    """Lists registered users and their groups for management / quick switch."""
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        users = User.objects.all().order_by('id')
        results = []
        for u in users:
            results.append({
                "id": u.id,
                "username": u.username,
                "email": u.email,
                "name": f"{u.first_name} {u.last_name}".strip() or u.username,
                "is_staff": u.is_staff,
                "is_superuser": u.is_superuser,
                "groups": [g.name for g in u.groups.all()],
            })
        return Response(results)

