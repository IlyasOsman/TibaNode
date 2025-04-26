from django.urls import path

from .views import (
    HealthProgramViewSet,
    ClientViewSet,
)

urlpatterns = [
    path(
        "healthprograms/",
        HealthProgramViewSet.as_view({"get": "list", "post": "create"}),
        name="healthprogram-list",
    ),
    path(
        "healthprograms/<int:pk>/",
        HealthProgramViewSet.as_view(
            {
                "get": "retrieve",
                "put": "update",
                "patch": "partial_update",
                "delete": "destroy",
            }
        ),
        name="healthprogram-detail",
    ),
    path(
        "clients/",
        ClientViewSet.as_view({"get": "list", "post": "create"}),
        name="client-list",
    ),
    path(
        "clients/<int:pk>/",
        ClientViewSet.as_view(
            {
                "get": "retrieve",
                "put": "update",
                "patch": "partial_update",
                "delete": "destroy",
            }
        ),
        name="client-detail",
    ),
    path(
        "clients/<int:pk>/profile/",
        ClientViewSet.as_view({"get": "profile"}),
        name="client-profile",
    ),
    path(
        "clients/<int:pk>/enroll/",
        ClientViewSet.as_view({"post": "enroll"}),
        name="client-enroll",
    ),
]
