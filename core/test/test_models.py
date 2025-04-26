from django.test import TestCase
from django.db.utils import IntegrityError
from datetime import date, timedelta
from core.models import HealthProgram, Client, Enrollment


class HealthProgramModelTest(TestCase):
    """Test cases for the HealthProgram model"""

    def setUp(self):
        self.program = HealthProgram.objects.create(
            name="TB Program",
            description="Tuberculosis treatment and prevention program",
        )

    def test_health_program_creation(self):
        """Test that a health program can be created with valid data"""
        self.assertEqual(self.program.name, "TB Program")
        self.assertEqual(
            self.program.description, "Tuberculosis treatment and prevention program"
        )
        self.assertIsNotNone(self.program.created_at)

    def test_health_program_str_representation(self):
        """Test the string representation of a health program"""
        self.assertEqual(str(self.program), "TB Program")


class ClientModelTest(TestCase):
    """Test cases for the Client model"""

    def setUp(self):
        # Create a test client born 30 years ago
        self.birth_date = date.today() - timedelta(days=365 * 30)
        self.client = Client.objects.create(
            first_name="John",
            last_name="Doe",
            date_of_birth=self.birth_date,
            gender="M",
            phone_number="123-456-7890",
            email="john.doe@example.com",
            address="123 Main St, Anytown",
        )

    def test_client_creation(self):
        """Test that a client can be created with valid data"""
        self.assertEqual(self.client.first_name, "John")
        self.assertEqual(self.client.last_name, "Doe")
        self.assertEqual(self.client.date_of_birth, self.birth_date)
        self.assertEqual(self.client.gender, "M")
        self.assertEqual(self.client.phone_number, "123-456-7890")
        self.assertEqual(self.client.email, "john.doe@example.com")
        self.assertEqual(self.client.address, "123 Main St, Anytown")
        self.assertIsNotNone(self.client.registration_date)

    def test_client_str_representation(self):
        """Test the string representation of a client"""
        self.assertEqual(str(self.client), "John Doe")

    def test_client_full_name_property(self):
        """Test the full_name property returns the expected value"""
        self.assertEqual(self.client.full_name, "John Doe")

    def test_client_age_property(self):
        """Test that age property calculates correctly"""
        today = date.today()

        expected_age = (
            today.year
            - self.client.date_of_birth.year
            - (
                (today.month, today.day)
                < (self.client.date_of_birth.month, self.client.date_of_birth.day)
            )
        )
        self.assertEqual(self.client.age, expected_age)

        # Test with a birth date that hasn't had a birthday this year
        future_birthday = (
            today.replace(month=12, day=31)
            if today.month < 12
            else today.replace(year=today.year + 1, month=1, day=1)
        )
        future_birthday = future_birthday.replace(year=future_birthday.year - 25)

        client_future_birthday = Client.objects.create(
            first_name="Jane",
            last_name="Smith",
            date_of_birth=future_birthday,
            gender="F",
        )

        expected_future_age = (
            today.year
            - client_future_birthday.date_of_birth.year
            - (
                (today.month, today.day)
                < (
                    client_future_birthday.date_of_birth.month,
                    client_future_birthday.date_of_birth.day,
                )
            )
        )
        self.assertEqual(client_future_birthday.age, expected_future_age)


class EnrollmentModelTest(TestCase):
    """Test cases for the Enrollment model"""

    def setUp(self):
        # Create a test client
        self.client = Client.objects.create(
            first_name="John",
            last_name="Doe",
            date_of_birth=date(1990, 1, 1),
            gender="M",
        )

        # Create test programs
        self.program1 = HealthProgram.objects.create(
            name="TB Program", description="Tuberculosis treatment program"
        )

        self.program2 = HealthProgram.objects.create(
            name="HIV Program", description="HIV treatment and prevention program"
        )

        # Create an enrollment
        self.enrollment = Enrollment.objects.create(
            client=self.client, program=self.program1, notes="Initial enrollment"
        )

    def test_enrollment_creation(self):
        """Test that an enrollment can be created with valid data"""
        self.assertEqual(self.enrollment.client, self.client)
        self.assertEqual(self.enrollment.program, self.program1)
        self.assertEqual(self.enrollment.notes, "Initial enrollment")
        self.assertEqual(self.enrollment.active, True)  # Default value
        self.assertIsNotNone(self.enrollment.enrollment_date)

    def test_enrollment_str_representation(self):
        """Test the string representation of an enrollment"""
        expected = f"{self.client} enrolled in {self.program1}"
        self.assertEqual(str(self.enrollment), expected)

    def test_client_multiple_enrollments(self):
        """Test that a client can be enrolled in multiple programs"""
        # Enroll the client in a second program
        enrollment2 = Enrollment.objects.create(
            client=self.client, program=self.program2
        )

        # Check that both enrollments exist
        client_enrollments = Enrollment.objects.filter(client=self.client)
        self.assertEqual(client_enrollments.count(), 2)
        self.assertIn(self.enrollment, client_enrollments)
        self.assertIn(enrollment2, client_enrollments)

    def test_unique_enrollment_constraint(self):
        """Test that a client cannot be enrolled in the same program twice"""
        # Attempt to create a duplicate enrollment
        with self.assertRaises(IntegrityError):
            Enrollment.objects.create(client=self.client, program=self.program1)

    def test_enrollment_related_name(self):
        """Test that related_name is properly set up for accessing enrollments"""
        # Access enrollments from client
        self.assertEqual(self.client.enrollments.count(), 1)
        self.assertEqual(self.client.enrollments.first(), self.enrollment)

        # Access enrollments from program
        self.assertEqual(self.program1.enrollments.count(), 1)
        self.assertEqual(self.program1.enrollments.first(), self.enrollment)

    def test_enrollment_deactivation(self):
        """Test that an enrollment can be deactivated"""
        self.enrollment.active = False
        self.enrollment.save()

        # Refresh from database
        refreshed_enrollment = Enrollment.objects.get(pk=self.enrollment.pk)
        self.assertFalse(refreshed_enrollment.active)

    def test_enrollment_cascade_deletion(self):
        """Test that enrollments are deleted when a client is deleted"""
        # Count enrollments before deletion
        enrollment_count_before = Enrollment.objects.count()
        self.assertEqual(enrollment_count_before, 1)

        # Delete the client
        self.client.delete()

        # Check that enrollment was deleted
        enrollment_count_after = Enrollment.objects.count()
        self.assertEqual(enrollment_count_after, 0)
