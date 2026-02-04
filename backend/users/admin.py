from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, RegularUser, PremiumUser, AdminUser, Lesson, LessonEnrollement

#ZA DORADU, TREBA DA SE SREDI JOS, MORA DA SE KREIRANJE I BRISANJE NEKAKO MALO SREDE NA ADMIN PANELU 

class RegularUserInline(admin.StackedInline):
    model = RegularUser
    can_delete = False

class PremiumUserInline(admin.StackedInline):
    model = PremiumUser
    can_delete = False

class AdminUserInline(admin.StackedInline):
    model = AdminUser
    can_delete = False

class UserAdmin(BaseUserAdmin):
    list_display = ('email', 'name', 'surname', 'birth_date', 'user_name', 'user_type','is_staff', 'is_active')
    list_filter = ('user_type', 'is_staff', 'is_active')
    
    fieldsets = (
        (None, {'fields': ('email', 'user_name', 'password')}),
        ('Lični podaci', {'fields': ('name', 'surname', 'birth_date')}),
        ('Tip korisnika', {'fields': ('user_type',)}),
        ('Dozvole', {'fields': ('is_active', 'is_staff', 'is_superuser')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'name', 'surname', 'user_type', 'password1', 'password2'),
        }),
    )
    
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('email',)

    def get_inline_instances(self, request, obj=None):
        if not obj:
            return []
        
        inlines = []
        if obj.user_type == 'regular':
            inlines.append(RegularUserInline(self.model, self.admin_site))
        elif obj.user_type == 'premium':
            inlines.append(PremiumUserInline(self.model, self.admin_site))
        elif obj.user_type == 'admin':
            inlines.append(AdminUserInline(self.model, self.admin_site))
        
        return inlines
    
class LessonEnrollmentAdmin(admin.ModelAdmin):
    list_display = ("user", "lesson", "status", "started_at")
    search_fields = ("user__email", "lesson__lesson_name")
    list_filter = ("status",)

admin.site.register(User, UserAdmin)
admin.site.register(RegularUser)
admin.site.register(PremiumUser)
admin.site.register(AdminUser)
admin.site.register(Lesson)
admin.site.register(LessonEnrollement)


# Register your models here.
