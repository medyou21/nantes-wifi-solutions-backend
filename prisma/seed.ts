import prisma from "../src/config/prisma";

async function main(): Promise<void> {
  const service = await prisma.service.upsert({
    where: { slug: "wifi" },
    update: {},
    create: {
      slug: "wifi",
      name: "Solutions Wi-Fi",
      description: "Diagnostic, installation et optimisation Wi-Fi",
    },
  });

  const offers = [
    {
      title: "Basic",
      priceCents: 7900,
      description: "Diagnostic initial de la couverture Wi-Fi.",
      features: ["Analyse de la couverture", "Compte rendu", "Conseils personnalisés"],
      displayOrder: 1,
    },
    {
      title: "Confort",
      priceCents: 19900,
      description: "Installation et optimisation Wi-Fi à domicile.",
      features: ["Diagnostic", "Installation", "Configuration", "Tests de performance"],
      highlighted: true,
      displayOrder: 2,
    },
    {
      title: "Pro",
      priceCents: 49900,
      description: "Solution pour entreprises et sites multi-zones.",
      features: ["Audit", "Architecture réseau", "Réseau invité", "Sécurisation"],
      displayOrder: 3,
    },
  ];

  for (const offer of offers) {
    await prisma.offer.upsert({
      where: { title: offer.title },
      update: { ...offer, serviceId: service.id },
      create: { ...offer, serviceId: service.id },
    });
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
