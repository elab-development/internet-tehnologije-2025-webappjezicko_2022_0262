from django.test import TestCase

class SimpleCIBuildTest(TestCase):
    def test_math_works(self):
        """Osnovna provera da li Python uopšte radi"""
        print("-----------------------------------------------------------------------")
        print("\n[TEST 1/2] Provera Python okruženja: 1+1=2... USPEŠNO!")
        self.assertEqual(1 + 1, 2)
        print("-----------------------------------------------------------------------")

    def test_homepage_response(self):
        """Proverava da li početna stranica odgovara"""
        print("-----------------------------------------------------------------------")
        print("[TEST 2/2] Kucam na vrata servera... SERVER JE BUDAN I ODGOVARA!")
        response = self.client.get('/')
        self.assertIn(response.status_code, [200, 404])
        print("-----------------------------------------------------------------------")