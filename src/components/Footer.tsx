
import { Stethoscope, Mail, Phone, MapPin, Github, Twitter, Linkedin } from "lucide-react";

const Footer = () => {
  const footerLinks = {
    produits: [
      { label: "Analyse de données", href: "#" },
      { label: "IA médicale", href: "#" },
      { label: "API", href: "#" },
      { label: "Intégrations", href: "#" }
    ],
    ressources: [
      { label: "Documentation", href: "#" },
      { label: "Guides", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Support", href: "#" }
    ],
    entreprise: [
      { label: "À propos", href: "#" },
      { label: "Carrières", href: "#" },
      { label: "Partenaires", href: "#" },
      { label: "Presse", href: "#" }
    ],
    legal: [
      { label: "Politique de confidentialité", href: "#" },
      { label: "Mentions légales", href: "#" },
      { label: "Conditions d'utilisation", href: "#" },
      { label: "FAQ", href: "#" }
    ]
  };

  const socialLinks = [
    { icon: Github, href: "#", label: "GitHub" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Linkedin, href: "#", label: "LinkedIn" }
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-6">
              <div className="bg-gradient-to-br from-blue-500 to-teal-400 p-2 rounded-lg">
                <Stethoscope className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-teal-300 bg-clip-text text-transparent">
                DataMed
              </span>
            </div>
            <p className="text-gray-400 mb-6 text-lg leading-relaxed">
              L'intelligence artificielle au service de vos données médicales. 
              Automatisez, sécurisez et optimisez vos processus de traitement de données.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center text-gray-400">
                <Mail className="h-5 w-5 mr-3 text-blue-400" />
                <span>contact@datamed.fr</span>
              </div>
              <div className="flex items-center text-gray-400">
                <Phone className="h-5 w-5 mr-3 text-blue-400" />
                <span>+33 1 23 45 67 89</span>
              </div>
              <div className="flex items-center text-gray-400">
                <MapPin className="h-5 w-5 mr-3 text-blue-400" />
                <span>Paris, France</span>
              </div>
            </div>
          </div>

          {/* Links Sections */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Produits</h3>
            <ul className="space-y-3">
              {footerLinks.produits.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="text-gray-400 hover:text-blue-400 transition-colors duration-200">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Ressources</h3>
            <ul className="space-y-3">
              {footerLinks.ressources.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="text-gray-400 hover:text-blue-400 transition-colors duration-200">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Entreprise</h3>
            <ul className="space-y-3">
              {footerLinks.entreprise.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="text-gray-400 hover:text-blue-400 transition-colors duration-200">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Légal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="text-gray-400 hover:text-blue-400 transition-colors duration-200">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-400 mb-4 md:mb-0">
            © 2024 DataMed. Tous droits réservés.
          </div>
          
          {/* Social Links */}
          <div className="flex space-x-4">
            {socialLinks.map((social, index) => (
              <a
                key={index}
                href={social.href}
                aria-label={social.label}
                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-blue-600 transition-all duration-200"
              >
                <social.icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
