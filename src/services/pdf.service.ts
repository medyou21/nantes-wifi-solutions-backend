// Import de PDFKit pour générer des fichiers PDF dynamiques
import PDFDocument from "pdfkit";

/**
 * ─────────────────────────────────────────────
 * 🎨 PALETTE DE COULEURS (charte graphique PDF)
 * ─────────────────────────────────────────────
 */
const C = {
  darkBg:      "#0A1628",
  bluePrimary: "#2979FF",
  blueLight:   "#64B5F6",
  orange:      "#FF6D00",
  white:       "#FFFFFF",
  greyText:    "#5F6368",
  lightBg:     "#F4F7FF",
  border:      "#E0E8FF",
};

/**
 * ─────────────────────────────────────────────
 * 📦 CONFIGURATION DES PLANS / OFFRES
 * Chaque plan contient :
 * - service associé
 * - couleur UI
 * - liste de fonctionnalités
 * ─────────────────────────────────────────────
 */
const PLANS: Record<string, { service: string; color: string; features: string[] }> = {
  Basic: {
    service: "Diagnostic Wi-Fi",
    color: C.blueLight,
    features: [
      "Diagnostic Wi-Fi complet",
      "Optimisation réseau",
      "Vérification sécurité",
      "Support email",
      "Rapport détaillé sous 24h",
    ],
  },

  Confort: {
    service: "Installation Wi-Fi",
    color: C.bluePrimary,
    features: [
      "Diagnostic Wi-Fi complet",
      "Optimisation réseau",
      "Vérification sécurité",
      "Installation avancée",
      "Matériel professionnel inclus",
      "Configuration QoS avancée",
      "Réseau invité séparé",
      "Garantie 2 ans pièces & main d'oeuvre",
      "Support email",
    ],
  },

  "Pro Entreprise": {
    service: "Réseau professionnel",
    color: C.orange,
    features: [
      "Tout le forfait Confort",
      "Support 24/7",
      "Réseau professionnel dédié",
      "Surveillance en continu",
      "Dashboard admin",
      "SLA garanti",
      "Audit réseau mensuel",
      "WPA3 Enterprise",
      "IDS (détection intrusion)",
      "Alertes SMS & email",
    ],
  },
};

/**
 * 💰 PRIX PAR PLAN (HT)
 */
const DEFAULT_PRICES: Record<string, number> = {
  Basic: 149,
  Confort: 349,
  "Pro Entreprise": 699,
};

/**
 * 🔗 MAPPING SERVICE → PLAN
 * Permet d'associer automatiquement un service à une offre
 */
const SERVICE_TO_PLAN: Record<string, string> = {
  "Diagnostic Wi-Fi": "Basic",
  "Installation Wi-Fi": "Confort",
  "Sécurité & Surveillance": "Confort",
  "Réseau professionnel": "Pro Entreprise",
  "Autre": "Basic",
};

/**
 * 🏢 INFORMATIONS ENTREPRISE
 * Utilisées dans l'en-tête et le footer du devis
 */
const COMPANY = {
  name:   "Nantes WiFi Solutions",
  address:"12 Rue de la Paix, 44000 Nantes",
  phone:  "06 12 34 55 78",
  email:  "contact@nantes-wifi-solutions.fr",
  siret:  "XXX XXX XXX 00012",
  tva:    "FR XX XXX XXX XXX",
};

/**
 * 📄 Interface des données nécessaires pour générer un devis
 */
export interface DevisInput {
  clientName:  string;
  clientEmail: string;
  clientPhone: string;
  service:     string;
  message:     string;
  devisNum:    string;
}

/**
 * ─────────────────────────────────────────────
 * 🚀 GÉNÉRATEUR DE DEVIS PDF
 * Retourne un Buffer PDF prêt à être envoyé par email
 * ─────────────────────────────────────────────
 */
export function generateDevisPDF(input: DevisInput): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      // Stockage des chunks PDF
      const chunks: Buffer[] = [];

      // Création du document PDF A4
      const doc = new PDFDocument({
        size: "A4",
        margin: 0,
        bufferPages: true,
      });

      // Collecte des données PDF en mémoire
      doc.on("data", (c) => chunks.push(c));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      const W = doc.page.width;
      const M = 40;

      const today = new Date();
      const fmt = (d: Date) => d.toLocaleDateString("fr-FR");

      const validDate = new Date(today.getTime() + 30 * 86_400_000);

      /**
       * 🔎 Résolution automatique du plan + prix
       * basé sur le service demandé
       */
      const plan = SERVICE_TO_PLAN[input.service] ?? "Basic";
      const planInfo = PLANS[plan] ?? PLANS["Basic"];
      const priceHT = DEFAULT_PRICES[plan] ?? 149;

      const priceTVA = Math.round(priceHT * 0.2 * 100) / 100;
      const priceTTC = Math.round((priceHT + priceTVA) * 100) / 100;

      // ─────────────────────────────
      // 🧾 HEADER DU DEVIS
      // ─────────────────────────────
      doc.rect(0, 0, W, 130).fill(C.darkBg);
      doc.rect(0, 130, W, 2).fill(C.bluePrimary);

      // Infos entreprise
      doc.fillColor(C.white).font("Helvetica-Bold").fontSize(20)
        .text(COMPANY.name, M, 22);

      doc.fillColor(C.blueLight).font("Helvetica").fontSize(8.5)
        .text(COMPANY.address, M, 50)
        .text(`${COMPANY.phone} · ${COMPANY.email}`, M, 63);

      // Numéro devis
      doc.fillColor(C.white).font("Helvetica-Bold").fontSize(11)
        .text(`DEVIS N° ${input.devisNum}`, M, 22, { align: "right", width: W - M * 2 });

      doc.fillColor(C.blueLight).fontSize(8.5)
        .text(`Date : ${fmt(today)}`, M, 42, { align: "right" })
        .text(`Valable jusqu'au : ${fmt(validDate)}`, M, 55, { align: "right" });

      // Badge plan
      doc.roundedRect(M, 82, 160, 36, 6).fill(planInfo.color);
      doc.fillColor(C.white).fontSize(13).text(plan, M + 12, 89);

      doc.fontSize(8).text(planInfo.service, M + 12, 106);

      // Prix total
      doc.fillColor(C.white).fontSize(22)
        .text(`${priceTTC.toFixed(2)} €`, M, 84, {
          align: "right",
          width: W - M * 2,
        });

      doc.fillColor(C.blueLight).fontSize(8)
        .text("TTC (TVA 20%)", M, 110, {
          align: "right",
          width: W - M * 2,
        });

      let y = 148;

      /**
       * 🧩 Fonction utilitaire : section
       */
      const section = (title: string) => {
        doc.fillColor(C.bluePrimary).fontSize(7).text(title, M, y);
        y += 12;

        doc.strokeColor(C.border)
          .moveTo(M, y)
          .lineTo(W - M, y)
          .stroke();

        y += 8;
      };

      // ─────────────────────────────
      // 👤 INFOS CLIENT
      // ─────────────────────────────
      section("INFORMATIONS CLIENT");

      doc.roundedRect(M, y, W - M * 2, 76, 4).fill(C.lightBg);
      y += 4;

      const row = (label: string, value: string) => {
        doc.fillColor(C.greyText).fontSize(8).text(label, M + 8, y);
        doc.fillColor(C.darkBg).text(value || "—", M + 110, y);
        y += 17;
      };

      row("Nom", input.clientName);
      row("Email", input.clientEmail);
      row("Téléphone", input.clientPhone);
      row("Service", input.service);

      y += 6;

      // ─────────────────────────────
      // 💬 MESSAGE CLIENT
      // ─────────────────────────────
      if (input.message) {
        section("MESSAGE");

        doc.roundedRect(M, y, W - M * 2, 56).fill("#FFF8F0");

        doc.fillColor(C.darkBg).text(input.message, M + 10, y + 6, {
          width: W - M * 2 - 20,
        });

        y += 68;
      }

      // ─────────────────────────────
      // 📦 DÉTAIL OFFRE
      // ─────────────────────────────
      section(`DÉTAIL DU FORFAIT — ${plan}`);

      doc.roundedRect(M, y, W - M * 2, 36).fill(planInfo.color);

      doc.fillColor(C.white).text(plan, M + 12, y + 8);
      doc.text(`${priceHT} € HT`, M, y + 10, {
        align: "right",
        width: W - M * 2,
      });

      y += 44;

      // Features
      planInfo.features.forEach((feat, i) => {
        doc.fillColor(C.darkBg).text(`✓ ${feat}`, M + 20, y);
        y += 16;
      });

      // ─────────────────────────────
      // 💰 PRIX
      // ─────────────────────────────
      y += 10;

      const tX = W - M - 200;

      [
        ["HT", priceHT],
        ["TVA", priceTVA],
        ["TTC", priceTTC],
      ].forEach(([label, val]) => {
        doc.text(`${label} : ${val} €`, tX, y);
        y += 15;
      });

      // ─────────────────────────────
      // FINALISATION PDF
      // ─────────────────────────────
      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}