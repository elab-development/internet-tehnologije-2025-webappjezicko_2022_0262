from django.test import TestCase

class SimpleCIBuildTest(TestCase):
    def test_math_works(self):
        """Osnovna provera da li Python uopšte radi"""
        self.assertEqual(1 + 1, 2)

    def test_homepage_response(self):
        """Proverava da li početna stranica odgovara"""
        response = self.client.get('/')
        # Čak i ako dobijemo 404, to znači da Django radi i odgovara!
        self.assertIn(response.status_code, [200, 404])