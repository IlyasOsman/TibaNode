from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import HealthProgram, Client, Enrollment
from .serializers import HealthProgramSerializer, ClientSerializer


class HealthProgramViewSet(viewsets.ModelViewSet):
    """
    API endpoint for creating and managing health programs
    """

    queryset = HealthProgram.objects.all()
    serializer_class = HealthProgramSerializer


class ClientViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing clients
    """

    queryset = Client.objects.all()
    serializer_class = ClientSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ["first_name", "last_name", "phone_number", "email"]

    @action(detail=True, methods=["get"])
    def profile(self, request, pk=None):
        """
        Return the client profile including enrolled programs
        """
        client = self.get_object()
        serializer = self.get_serializer(client)
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def enroll(self, request, pk=None):
        """
        Enroll a client in a health program
        """
        client = self.get_object()
        program_id = request.data.get("program_id")

        if not program_id:
            return Response({"error": "Program ID is required"}, status=400)

        program = get_object_or_404(HealthProgram, id=program_id)

        # Check if client is already enrolled
        enrollment, created = Enrollment.objects.get_or_create(
            client=client, program=program, defaults={"active": True}
        )

        if not created:
            # If enrollment exists but is not active, make it active
            if not enrollment.active:
                enrollment.active = True
                enrollment.save()
                return Response({"message": f"Client re-enrolled in {program.name}"})
            return Response({"message": f"Client already enrolled in {program.name}"})

        return Response({"message": f"Client successfully enrolled in {program.name}"})
