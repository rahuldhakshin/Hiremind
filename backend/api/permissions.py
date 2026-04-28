from rest_framework.permissions import BasePermission


class IsStudent(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'student'


class IsRecruiter(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'recruiter'


class IsPlacementOfficer(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'placement_officer'


class IsAdminUser(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'


class IsStudentOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in ('GET', 'HEAD', 'OPTIONS'):
            return request.user.is_authenticated
        return request.user.is_authenticated and request.user.role == 'student'


class IsRecruiterOrPlacementOfficer(BasePermission):
    def has_permission(self, request, view):
        return (request.user.is_authenticated and
                request.user.role in ('recruiter', 'placement_officer', 'admin'))


class IsOwnerOrAdmin(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.role in ('admin', 'placement_officer'):
            return True
        if hasattr(obj, 'user'):
            return obj.user == request.user
        if hasattr(obj, 'student'):
            return obj.student == request.user
        if hasattr(obj, 'recruiter'):
            return obj.recruiter == request.user
        if hasattr(obj, 'reviewer'):
            return obj.reviewer == request.user
        if hasattr(obj, 'sender'):
            return obj.sender == request.user
        return False