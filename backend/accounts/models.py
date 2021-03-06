from django.db import models
from django.utils import timezone
from django.contrib.auth.base_user import BaseUserManager
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin

class UserManager(BaseUserManager):
    use_in_migrations = True

    def create_user(self, email, name, password=None):

        if not email:
            raise ValueError("User must have a valid email address")

        user = self.model(
            email=self.normalize_email(email),
            name=name)

        user.set_password(password)
        user.is_active = True
        user.save()

        return user

    def create_superuser(self, email, name, password):

        user = self.create_user(email, name, password)

        user.is_superuser = True
        user.is_active = True
        user.save()

        return user


class User (AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=100)
    avatar = models.URLField(blank=True, null=True)
    password2 = models.CharField(max_length=255, blank=True, null=True)
    chat_users = models.ManyToManyField("self", blank=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']

    def __str__(self):
        return "{}".format(self.email)
