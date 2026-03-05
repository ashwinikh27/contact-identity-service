const prisma = require("../prismaClient");

async function identifyContact(req, res) {
  try {
    const { email, phoneNumber } = req.body;

    // Find existing contacts with same email or phone
    const existingContacts = await prisma.contact.findMany({
      where: {
        OR: [
          { email: email || undefined },
          { phoneNumber: phoneNumber || undefined }
        ]
      },
      orderBy: {
        createdAt: "asc"
      }
    });

    // If no contacts exist → create primary
    if (existingContacts.length === 0) {
      const newContact = await prisma.contact.create({
        data: {
          email,
          phoneNumber,
          linkPrecedence: "primary"
        }
      });

      return res.status(200).json({
        contact: {
          primaryContactId: newContact.id,
          emails: [newContact.email],
          phoneNumbers: [newContact.phoneNumber],
          secondaryContactIds: []
        }
      });
    }

    // Determine primary contact
    const primaryContact =
      existingContacts.find(c => c.linkPrecedence === "primary") ||
      existingContacts[0];

    let secondaryContacts = existingContacts.filter(
      c => c.id !== primaryContact.id
    );

    // Check if new info exists
    const emailExists = existingContacts.some(c => c.email === email);
    const phoneExists = existingContacts.some(c => c.phoneNumber === phoneNumber);

    // Create secondary contact if new info
    if (!emailExists || !phoneExists) {
      const newSecondary = await prisma.contact.create({
        data: {
          email,
          phoneNumber,
          linkedId: primaryContact.id,
          linkPrecedence: "secondary"
        }
      });

      secondaryContacts.push(newSecondary);
    }

    // Collect all emails and phones
    const emails = new Set();
    const phones = new Set();

    [primaryContact, ...secondaryContacts].forEach(c => {
      if (c.email) emails.add(c.email);
      if (c.phoneNumber) phones.add(c.phoneNumber);
    });

    return res.status(200).json({
      contact: {
        primaryContactId: primaryContact.id,
        emails: Array.from(emails),
        phoneNumbers: Array.from(phones),
        secondaryContactIds: secondaryContacts.map(c => c.id)
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = { identifyContact };