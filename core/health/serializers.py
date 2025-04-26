from rest_framework import serializers
from .models import HealthProgram, Client, Enrollment


class HealthProgramSerializer(serializers.ModelSerializer):
    class Meta:
        model = HealthProgram
        fields = "__all__"


class EnrollmentSerializer(serializers.ModelSerializer):
    program_name = serializers.ReadOnlyField(source="program.name")

    class Meta:
        model = Enrollment
        fields = ["id", "program", "program_name", "enrollment_date", "active", "notes"]


class ClientSerializer(serializers.ModelSerializer):
    age = serializers.ReadOnlyField()
    full_name = serializers.ReadOnlyField()
    enrollments = EnrollmentSerializer(many=True, read_only=True)

    class Meta:
        model = Client
        fields = [
            "id",
            "first_name",
            "last_name",
            "full_name",
            "date_of_birth",
            "age",
            "gender",
            "phone_number",
            "email",
            "address",
            "registration_date",
            "enrollments",
        ]
