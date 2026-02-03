from django.db import models

class Contact(models.Model):
    name = models.CharField(max_length=120)
    email = models.EmailField()
    company = models.CharField(max_length=120)
    subject = models.CharField(max_length=120)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return f"{self.name} ({self.email}) - {self.company}"
