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

    // Check if multiple primary contacts exist
const primaryContacts = existingContacts.filter(
  c => c.linkPrecedence === "primary"
);

// Fetch all contacts linked to the primary contact
const allLinkedContacts = await prisma.contact.findMany({
  where: {
    OR: [
      { id: primaryContact.id },
      { linkedId: primaryContact.id }
    ]
  },
  orderBy: {
    createdAt: "asc"
  }
});

if (primaryContacts.length > 1) {
  const oldestPrimary = primaryContacts[0];

  for (let i = 1; i < primaryContacts.length; i++) {
    await prisma.contact.update({
      where: { id: primaryContacts[i].id },
      data: {
        linkPrecedence: "secondary",
        linkedId: oldestPrimary.id
      }
    });
  }
}

    // Check if new info exists
    const emailExists = existingContacts.some(c => c.email === email);
    const phoneExists = existingContacts.some(c => c.phoneNumber === phoneNumber);

   // Create secondary contact only if NEW information is provided
if ((email && !emailExists) || (phoneNumber && !phoneExists)) {
  const newSecondary = await prisma.contact.create({
    data: {
      email,
      phoneNumber,
      linkedId: primaryContact.id,
      linkPrecedence: "secondary"
    }
  });

  secondaryContacts.push(newSecondary);

  // also add it to linked contacts so response includes it
  allLinkedContacts.push(newSecondary);
}

    // Collect all emails and phones
const emails = new Set();
const phones = new Set();
const secondaryIds = [];

allLinkedContacts.forEach(contact => {
  if (contact.email) emails.add(contact.email);
  if (contact.phoneNumber) phones.add(contact.phoneNumber);

  if (contact.linkPrecedence === "secondary") {
    secondaryIds.push(contact.id);
  }
});

    return res.status(200).json({
      contact: {
        primaryContactId: primaryContact.id,
        emails: Array.from(emails),
        phoneNumbers: Array.from(phones),
secondaryContactIds: secondaryIds      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = { identifyContact };