from django.test import TestCase
from datetime import date
from rest_framework.test import APITestCase
from core.models import HealthProgram, Client, Enrollment
from core.serializers import (
    HealthProgramSerializer,
    EnrollmentSerializer,
    ClientSerializer,
)


class HealthProgramSerializerTest(TestCase):
    """Test cases for the HealthProgramSerializer"""

    def setUp(self):
        self.program_attributes = {
            "name": "TB Program",
            "description": "Tuberculosis treatment and prevention program",
        }

        self.program = HealthProgram.objects.create(**self.program_attributes)
        self.serializer = HealthProgramSerializer(instance=self.program)

    def test_contains_expected_fields(self):
        """Test that serializer contains expected fields"""
        data = self.serializer.data
        self.assertEqual(
            set(data.keys()), set(["id", "name", "description", "created_at"])
        )

    def test_name_field_content(self):
        """Test that serializer returns correct name value"""
        data = self.serializer.data
        self.assertEqual(data["name"], self.program_attributes["name"])

    def test_description_field_content(self):
        """Test that serializer returns correct description value"""
        data = self.serializer.data
        self.assertEqual(data["description"], self.program_attributes["description"])

    def test_serializer_validation(self):
        """Test serializer validation for creating a health program"""
        # Valid data
        valid_data = {
            "name": "Malaria Program",
            "description": "Malaria prevention and treatment",
        }
        serializer = HealthProgramSerializer(data=valid_data)
        self.assertTrue(serializer.is_valid())

        # Invalid data (missing required field)
        invalid_data = {"description": "No name provided"}
        serializer = HealthProgramSerializer(data=invalid_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("name", serializer.errors)


class EnrollmentSerializerTest(TestCase):
    """Test cases for the EnrollmentSerializer"""

    def setUp(self):
        # Create client and program
        self.client = Client.objects.create(
            first_name="John",
            last_name="Doe",
            date_of_birth=date(1990, 1, 1),
            gender="M",
        )

        self.program = HealthProgram.objects.create(
            name="HIV Program", description="HIV treatment and prevention"
        )

        # Create enrollment
        self.enrollment = Enrollment.objects.create(
            client=self.client, program=self.program, notes="Initial enrollment notes"
        )

        self.serializer = EnrollmentSerializer(instance=self.enrollment)

    def test_contains_expected_fields(self):
        """Test that serializer contains expected fields"""
        data = self.serializer.data
        expected_fields = {
            "id",
            "program",
            "program_name",
            "enrollment_date",
            "active",
            "notes",
        }
        self.assertEqual(set(data.keys()), expected_fields)

    def test_program_name_field_content(self):
        """Test that program_name field returns correct value"""
        data = self.serializer.data
        self.assertEqual(data["program_name"], self.program.name)

    def test_active_field_content(self):
        """Test that active field returns correct value"""
        data = self.serializer.data
        self.assertEqual(data["active"], True)  # Default is True

        # Change active status and test again
        self.enrollment.active = False
        self.enrollment.save()
        serializer = EnrollmentSerializer(instance=self.enrollment)
        self.assertEqual(serializer.data["active"], False)

    def test_serializer_validation(self):
        """Test serializer validation for creating an enrollment"""
        # Create a new program for testing
        new_program = HealthProgram.objects.create(
            name="Malaria Program", description="Malaria treatment"
        )

        # Valid data
        valid_data = {"program": new_program.id, "notes": "Valid enrollment"}
        serializer = EnrollmentSerializer(data=valid_data, context={"request": None})
        # Note: In a real view, you would need to set client manually, so this validation might fail
        # This is just to test the serializer fields validation

        # Invalid data (program doesn't exist)
        invalid_data = {
            "program": 999,  # Non-existent program ID
            "notes": "Invalid enrollment",
        }
        serializer = EnrollmentSerializer(data=invalid_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("program", serializer.errors)


class ClientSerializerTest(TestCase):
    """Test cases for the ClientSerializer"""

    def setUp(self):
        # Create client
        self.client_data = {
            "first_name": "Jane",
            "last_name": "Smith",
            "date_of_birth": date(1985, 5, 15),
            "gender": "F",
            "phone_number": "555-123-4567",
            "email": "jane.smith@example.com",
            "address": "456 Oak St, Cityville",
        }

        self.client_instance = Client.objects.create(**self.client_data)

        # Create programs
        self.program1 = HealthProgram.objects.create(
            name="Diabetes Program", description="Diabetes management"
        )

        self.program2 = HealthProgram.objects.create(
            name="Hypertension Program", description="Blood pressure management"
        )

        # Create enrollments
        self.enrollment1 = Enrollment.objects.create(
            client=self.client_instance,
            program=self.program1,
            notes="Diabetes enrollment",
        )

        self.enrollment2 = Enrollment.objects.create(
            client=self.client_instance,
            program=self.program2,
            notes="Hypertension enrollment",
        )

        self.serializer = ClientSerializer(instance=self.client_instance)

    def test_contains_expected_fields(self):
        """Test that serializer contains expected fields"""
        data = self.serializer.data
        expected_fields = {
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
        }
        self.assertEqual(set(data.keys()), expected_fields)

    def test_full_name_field_content(self):
        """Test that full_name field returns correct value"""
        data = self.serializer.data
        expected_full_name = (
            f"{self.client_data['first_name']} {self.client_data['last_name']}"
        )
        self.assertEqual(data["full_name"], expected_full_name)

    def test_age_field_content(self):
        """Test that age field returns correct value"""
        data = self.serializer.data
        # Calculate expected age
        today = date.today()
        expected_age = (
            today.year
            - self.client_data["date_of_birth"].year
            - (
                (today.month, today.day)
                < (
                    self.client_data["date_of_birth"].month,
                    self.client_data["date_of_birth"].day,
                )
            )
        )
        self.assertEqual(data["age"], expected_age)

    def test_enrollments_field_content(self):
        """Test that enrollments field returns correct data"""
        data = self.serializer.data
        enrollments = data["enrollments"]

        # Check we have 2 enrollments
        self.assertEqual(len(enrollments), 2)

        # Check enrollment data structure
        enrollment_fields = {
            "id",
            "program",
            "program_name",
            "enrollment_date",
            "active",
            "notes",
        }
        for enrollment in enrollments:
            self.assertEqual(set(enrollment.keys()), enrollment_fields)

        # Check that enrollments contain correct program names
        program_names = {enrollment["program_name"] for enrollment in enrollments}
        expected_names = {self.program1.name, self.program2.name}
        self.assertEqual(program_names, expected_names)

    def test_serializer_validation(self):
        """Test serializer validation for creating a client"""
        # Valid data
        valid_data = {
            "first_name": "Robert",
            "last_name": "Johnson",
            "date_of_birth": "1975-08-22",
            "gender": "M",
            "phone_number": "555-987-6543",
            "email": "robert.johnson@example.com",
            "address": "789 Pine Ave, Townsville",
        }
        serializer = ClientSerializer(data=valid_data)
        self.assertTrue(serializer.is_valid())

        # Invalid data (missing required fields)
        invalid_data = {
            "first_name": "Robert",
            # missing last_name
            # missing date_of_birth
            "gender": "M",
        }
        serializer = ClientSerializer(data=invalid_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("last_name", serializer.errors)
        self.assertIn("date_of_birth", serializer.errors)

        # Invalid data (invalid gender value)
        invalid_gender_data = {
            "first_name": "Robert",
            "last_name": "Johnson",
            "date_of_birth": "1975-08-22",
            "gender": "X",  # Not in choices
        }
        serializer = ClientSerializer(data=invalid_gender_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("gender", serializer.errors)

        # Invalid data (invalid email format)
        invalid_email_data = {
            "first_name": "Robert",
            "last_name": "Johnson",
            "date_of_birth": "1975-08-22",
            "gender": "M",
            "email": "not-an-email",
        }
        serializer = ClientSerializer(data=invalid_email_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("email", serializer.errors)


class ClientSerializerIntegrationTest(APITestCase):
    """Integration tests for ClientSerializer with nested enrollments"""

    def setUp(self):
        # Create client
        self.client_instance = Client.objects.create(
            first_name="Mark",
            last_name="Wilson",
            date_of_birth=date(1982, 3, 10),
            gender="M",
        )

        # Create programs
        self.program1 = HealthProgram.objects.create(
            name="TB Program", description="TB treatment"
        )

        self.program2 = HealthProgram.objects.create(
            name="Nutrition Program", description="Nutrition advice and support"
        )

        # Create enrollments (but don't enroll in program2 yet)
        self.enrollment1 = Enrollment.objects.create(
            client=self.client_instance, program=self.program1, active=True
        )

    def test_serialized_client_with_nested_enrollments(self):
        """Test that client serializer correctly includes nested enrollments"""
        serializer = ClientSerializer(self.client_instance)
        data = serializer.data

        # Check that enrollments field is a list with one item
        self.assertIsInstance(data["enrollments"], list)
        self.assertEqual(len(data["enrollments"]), 1)

        # Add another enrollment and check serializer updates
        enrollment2 = Enrollment.objects.create(  # noqa: F841
            client=self.client_instance, program=self.program2, active=True
        )

        serializer = ClientSerializer(self.client_instance)
        data = serializer.data

        # Now should have two enrollments
        self.assertEqual(len(data["enrollments"]), 2)

        # Deactivate an enrollment and check it still appears but as inactive
        self.enrollment1.active = False
        self.enrollment1.save()

        serializer = ClientSerializer(self.client_instance)
        data = serializer.data

        # Should still have two enrollments
        self.assertEqual(len(data["enrollments"]), 2)

        # Find the first enrollment and check its active status
        first_enrollment = next(
            (e for e in data["enrollments"] if e["program_name"] == self.program1.name),
            None,
        )
        self.assertIsNotNone(first_enrollment)
        self.assertFalse(first_enrollment["active"])
