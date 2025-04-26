from django.db import models


class HealthProgram(models.Model):
    """
    Model representing a health program (e.g., TB, Malaria, HIV)
    """

    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Client(models.Model):
    """
    Model representing a client in the health system
    """

    GENDER_CHOICES = [
        ("M", "Male"),
        ("F", "Female"),
        ("O", "Other"),
    ]

    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    date_of_birth = models.DateField()
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES)
    phone_number = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    address = models.TextField(blank=True)
    registration_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    @property
    def age(self):
        from datetime import date

        today = date.today()
        return (
            today.year
            - self.date_of_birth.year
            - (
                (today.month, today.day)
                < (self.date_of_birth.month, self.date_of_birth.day)
            )
        )


class Enrollment(models.Model):
    """
    Model representing a client's enrollment in a health program
    """

    client = models.ForeignKey(
        Client, on_delete=models.CASCADE, related_name="enrollments"
    )
    program = models.ForeignKey(
        HealthProgram, on_delete=models.CASCADE, related_name="enrollments"
    )
    enrollment_date = models.DateField(auto_now_add=True)
    active = models.BooleanField(default=True)
    notes = models.TextField(blank=True)

    class Meta:
        unique_together = ["client", "program"]

    def __str__(self):
        return f"{self.client} enrolled in {self.program}"
