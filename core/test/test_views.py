from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient, APITestCase
from core.health.models import HealthProgram, Client, Enrollment
from datetime import date


class HealthProgramViewSetTest(APITestCase):
    def setUp(self):
        """Set up test data for HealthProgram tests"""
        self.client = APIClient()
        self.health_program = HealthProgram.objects.create(
            name="Weight Loss Program", description="A program designed for weight loss"
        )

    def test_get_all_health_programs(self):
        """Test retrieving all health programs"""
        url = reverse("healthprogram-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_create_health_program(self):
        """Test creating a new health program"""
        url = reverse("healthprogram-list")
        data = {"name": "Yoga Program", "description": "A yoga training program"}
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(HealthProgram.objects.count(), 2)
        self.assertEqual(
            HealthProgram.objects.get(name="Yoga Program").description,
            "A yoga training program",
        )

    def test_get_single_health_program(self):
        """Test retrieving a single health program"""
        url = reverse("healthprogram-detail", kwargs={"pk": self.health_program.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "Weight Loss Program")

    def test_update_health_program(self):
        """Test updating a health program"""
        url = reverse("healthprogram-detail", kwargs={"pk": self.health_program.id})
        data = {
            "name": "Updated Weight Loss Program",
            "description": "An updated program",
        }
        response = self.client.put(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.health_program.refresh_from_db()
        self.assertEqual(self.health_program.name, "Updated Weight Loss Program")
        self.assertEqual(self.health_program.description, "An updated program")

    def test_partial_update_health_program(self):
        """Test partially updating a health program"""
        url = reverse("healthprogram-detail", kwargs={"pk": self.health_program.id})
        data = {"name": "Partially Updated Program"}
        response = self.client.patch(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.health_program.refresh_from_db()
        self.assertEqual(self.health_program.name, "Partially Updated Program")
        # Description should remain unchanged
        self.assertEqual(
            self.health_program.description, "A program designed for weight loss"
        )

    def test_delete_health_program(self):
        """Test deleting a health program"""
        url = reverse("healthprogram-detail", kwargs={"pk": self.health_program.id})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(HealthProgram.objects.count(), 0)


class ClientViewSetTest(APITestCase):
    def setUp(self):
        """Set up test data for Client tests"""
        self.client = APIClient()

        # Create test client
        self.client_instance = Client.objects.create(
            first_name="John",
            last_name="Doe",
            date_of_birth=date(1990, 1, 15),
            gender="M",
            phone_number="1234567890",
            email="john.doe@example.com",
            address="123 Main St",
        )

        # Create test health program
        self.health_program = HealthProgram.objects.create(
            name="Fitness Program", description="A fitness training program"
        )

    def test_get_all_clients(self):
        """Test retrieving all clients"""
        url = reverse("client-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_create_client(self):
        """Test creating a new client"""
        url = reverse("client-list")
        data = {
            "first_name": "Jane",
            "last_name": "Smith",
            "date_of_birth": "1985-03-20",
            "gender": "F",
            "phone_number": "0987654321",
            "email": "jane.smith@example.com",
            "address": "456 Oak St",
        }
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Client.objects.count(), 2)

        # Verify the client was created with correct data
        created_client = Client.objects.get(email="jane.smith@example.com")
        self.assertEqual(created_client.first_name, "Jane")
        self.assertEqual(created_client.last_name, "Smith")
        self.assertEqual(created_client.gender, "F")

    def test_get_client_detail(self):
        """Test retrieving a single client"""
        url = reverse("client-detail", kwargs={"pk": self.client_instance.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["first_name"], "John")
        self.assertEqual(response.data["last_name"], "Doe")
        self.assertEqual(response.data["full_name"], "John Doe")
        self.assertIn("age", response.data)

    def test_update_client(self):
        """Test updating a client"""
        url = reverse("client-detail", kwargs={"pk": self.client_instance.id})
        data = {
            "first_name": "John",
            "last_name": "Smith",
            "date_of_birth": "1990-01-15",
            "gender": "M",
            "phone_number": "1234567890",
            "email": "john.smith@example.com",
            "address": "789 Elm St",
        }
        response = self.client.put(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.client_instance.refresh_from_db()
        self.assertEqual(self.client_instance.last_name, "Smith")
        self.assertEqual(self.client_instance.email, "john.smith@example.com")
        self.assertEqual(self.client_instance.address, "789 Elm St")

    def test_partial_update_client(self):
        """Test partially updating a client"""
        url = reverse("client-detail", kwargs={"pk": self.client_instance.id})
        data = {"phone_number": "5551234567"}
        response = self.client.patch(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.client_instance.refresh_from_db()
        self.assertEqual(self.client_instance.phone_number, "5551234567")
        # Other fields should remain unchanged
        self.assertEqual(self.client_instance.first_name, "John")
        self.assertEqual(self.client_instance.last_name, "Doe")

    def test_delete_client(self):
        """Test deleting a client"""
        url = reverse("client-detail", kwargs={"pk": self.client_instance.id})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Client.objects.count(), 0)

    def test_search_clients_by_name(self):
        """Test searching for clients by name"""
        # Create another client for search testing
        Client.objects.create(
            first_name="Jane",
            last_name="Smith",
            date_of_birth=date(1985, 3, 20),
            gender="F",
            phone_number="0987654321",
            email="jane.smith@example.com",
        )

        # Test search by first name
        url = reverse("client-list") + "?search=John"
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["first_name"], "John")

        # Test search by last name
        url = reverse("client-list") + "?search=Smith"
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["first_name"], "Jane")

    def test_search_clients_by_contact(self):
        """Test searching for clients by contact information"""
        # Create another client for search testing
        Client.objects.create(
            first_name="Jane",
            last_name="Smith",
            date_of_birth=date(1985, 3, 20),
            gender="F",
            phone_number="0987654321",
            email="jane.smith@example.com",
        )

        # Test search by phone number
        url = reverse("client-list") + "?search=123456"  # Partial phone number
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["phone_number"], "1234567890")

        # Test search by email domain
        url = reverse("client-list") + "?search=example.com"
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)  # Both clients should match

    def test_client_profile_action(self):
        """Test the profile custom action"""
        url = reverse("client-profile", kwargs={"pk": self.client_instance.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["first_name"], "John")
        self.assertEqual(response.data["last_name"], "Doe")
        self.assertEqual(response.data["full_name"], "John Doe")

        # Test that enrollments are included in the response
        self.assertIn("enrollments", response.data)
        self.assertEqual(len(response.data["enrollments"]), 0)  # No enrollments yet

        # Create an enrollment and test again
        Enrollment.objects.create(
            client=self.client_instance, program=self.health_program, active=True
        )

        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["enrollments"]), 1)
        self.assertEqual(
            response.data["enrollments"][0]["program_name"], "Fitness Program"
        )

    def test_enroll_client_action(self):
        """Test enrolling a client in a program"""
        url = reverse("client-enroll", kwargs={"pk": self.client_instance.id})
        data = {"program_id": self.health_program.id}
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data["message"],
            f"Client successfully enrolled in {self.health_program.name}",
        )

        # Verify enrollment was created
        enrollment = Enrollment.objects.filter(
            client=self.client_instance, program=self.health_program
        ).first()
        self.assertIsNotNone(enrollment)
        self.assertTrue(enrollment.active)

    def test_enroll_client_missing_program_id(self):
        """Test enrolling a client without providing a program ID"""
        url = reverse("client-enroll", kwargs={"pk": self.client_instance.id})
        data = {}  # Missing program_id
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["error"], "Program ID is required")

    def test_enroll_client_already_enrolled(self):
        """Test enrolling a client who is already enrolled in a program"""
        # First enrollment
        Enrollment.objects.create(
            client=self.client_instance, program=self.health_program, active=True
        )

        # Try to enroll again
        url = reverse("client-enroll", kwargs={"pk": self.client_instance.id})
        data = {"program_id": self.health_program.id}
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data["message"],
            f"Client already enrolled in {self.health_program.name}",
        )

        # Check there's still only one enrollment
        enrollments = Enrollment.objects.filter(
            client=self.client_instance, program=self.health_program
        )
        self.assertEqual(enrollments.count(), 1)

    def test_reenroll_inactive_client(self):
        """Test re-enrolling a client who was previously inactive"""
        # Create an inactive enrollment
        Enrollment.objects.create(
            client=self.client_instance, program=self.health_program, active=False
        )

        # Re-enroll
        url = reverse("client-enroll", kwargs={"pk": self.client_instance.id})
        data = {"program_id": self.health_program.id}
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data["message"],
            f"Client re-enrolled in {self.health_program.name}",
        )

        # Verify enrollment is now active
        enrollment = Enrollment.objects.get(
            client=self.client_instance, program=self.health_program
        )
        self.assertTrue(enrollment.active)

    def test_enroll_with_invalid_program_id(self):
        """Test enrolling with a non-existent program ID"""
        url = reverse("client-enroll", kwargs={"pk": self.client_instance.id})
        data = {"program_id": 9999}  # Non-existent program ID
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
