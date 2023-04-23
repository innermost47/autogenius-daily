import imaplib
import email

# Vos identifiants Gmail
gmail_address = "autogenius.daily@gmail.com"
gmail_password = "#Wilders666"

# Connexion au serveur IMAP de Gmail
mail = imaplib.IMAP4_SSL("imap.gmail.com")
mail.login(gmail_address, gmail_password)

# Sélectionner la boîte de réception et rechercher les e-mails non lus
mail.select("inbox")
result, data = mail.search(None, "UNSEEN")

# Récupérer et afficher les e-mails non lus
ids = data[0]
id_list = ids.split()
for email_id in id_list:
    result, email_data = mail.fetch(email_id, "(RFC822)")
    raw_email = email_data[0][1]
    msg = email.message_from_bytes(raw_email)
    print("Subject:", msg["subject"])
    print("From:", msg["from"])
    print("Date:", msg["date"])
    print("---")

# Se déconnecter du serveur IMAP
mail.logout()
