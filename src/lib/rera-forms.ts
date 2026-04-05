/**
 * RERA / DLD Form Templates for Dubai Real Estate Brokers
 *
 * Standard forms per RERA Law (Dubai Regulatory Authority for Real Estate):
 *   Form A – Listing Agreement (seller ↔ broker)
 *   Form B – Buyer's Agreement (buyer ↔ broker)
 *   Form F – Contract F / MOU (buyer ↔ seller via brokers)
 *   Form I – Unilateral Notification (single agent representation)
 *   Form U – Termination Notice
 *
 * Templates below render as markdown/plain-text. For binding PDFs,
 * brokers must use RERA's official Trakheesi / Dubai REST forms.
 */

export type FormType = "A" | "B" | "F" | "I" | "U";

export interface FormData {
  // Broker
  brokerName?: string;
  brokerId?: string; // BRN
  brokerPhone?: string;
  brokerEmail?: string;
  brokerAgency?: string;
  brokerAgencyLicense?: string; // ORN

  // Seller (for A, F)
  sellerName?: string;
  sellerPassport?: string;
  sellerEmiratesId?: string;
  sellerPhone?: string;
  sellerEmail?: string;
  sellerNationality?: string;

  // Buyer (for B, F)
  buyerName?: string;
  buyerPassport?: string;
  buyerEmiratesId?: string;
  buyerPhone?: string;
  buyerEmail?: string;
  buyerNationality?: string;

  // Property
  propertyName?: string;
  propertyType?: string;
  propertyAddress?: string;
  community?: string;
  bedrooms?: string;
  size?: string;
  titleDeedNumber?: string;
  makaniNumber?: string;
  dldPermitNumber?: string;

  // Transaction
  salePrice?: number;
  commissionPct?: number;
  commissionAmount?: number;
  depositAmount?: number;
  completionDate?: string;
  listingPeriod?: string; // e.g. "3 months"

  // Meta
  date?: string;
  location?: string;
}

function fmtAed(n?: number): string {
  if (!n) return "_______________";
  return new Intl.NumberFormat("en-AE", { style: "currency", currency: "AED", minimumFractionDigits: 0 }).format(n);
}

function v(x?: string | number): string {
  return x === undefined || x === null || x === "" ? "_______________" : String(x);
}

export function renderForm(type: FormType, d: FormData): { title: string; body: string } {
  const date = d.date || new Date().toLocaleDateString("en-AE", { year: "numeric", month: "long", day: "numeric" });
  const location = d.location || "Dubai, UAE";

  if (type === "A") {
    return {
      title: "Form A – Listing Agreement",
      body: `FORM A – LISTING AGREEMENT BETWEEN BROKER AND SELLER
(Real Estate Regulatory Agency – RERA, Dubai)

Date: ${date}
Location: ${location}

─────────────────────────────────────────────────
1. BROKERAGE COMPANY
─────────────────────────────────────────────────
Company Name: ${v(d.brokerAgency)}
ORN (Office Registration No): ${v(d.brokerAgencyLicense)}
Broker Name: ${v(d.brokerName)}
BRN (Broker Registration No): ${v(d.brokerId)}
Phone: ${v(d.brokerPhone)}
Email: ${v(d.brokerEmail)}

─────────────────────────────────────────────────
2. SELLER / OWNER
─────────────────────────────────────────────────
Full Name: ${v(d.sellerName)}
Nationality: ${v(d.sellerNationality)}
Passport No: ${v(d.sellerPassport)}
Emirates ID: ${v(d.sellerEmiratesId)}
Phone: ${v(d.sellerPhone)}
Email: ${v(d.sellerEmail)}

─────────────────────────────────────────────────
3. PROPERTY DETAILS
─────────────────────────────────────────────────
Property: ${v(d.propertyName)}
Type: ${v(d.propertyType)}
Community: ${v(d.community)}
Bedrooms: ${v(d.bedrooms)}
Size: ${v(d.size)} sqft
Address: ${v(d.propertyAddress)}
Title Deed No: ${v(d.titleDeedNumber)}
Makani No: ${v(d.makaniNumber)}
DLD Permit No: ${v(d.dldPermitNumber)}

─────────────────────────────────────────────────
4. LISTING TERMS
─────────────────────────────────────────────────
Listing Price: ${fmtAed(d.salePrice)}
Commission: ${v(d.commissionPct)}% of sale price (${fmtAed(d.commissionAmount)})
Listing Period: ${v(d.listingPeriod)}
Representation: Non-exclusive / Exclusive (circle one)

─────────────────────────────────────────────────
5. SELLER DECLARATIONS
─────────────────────────────────────────────────
• The Seller confirms ownership of the property and the right to sell.
• Property is free from encumbrances unless otherwise stated.
• Seller authorises the Broker to market the property on Dubai portals
  (Bayut, PropertyFinder, Dubizzle) using the DLD Permit Number above.
• Commission is payable upon successful transfer at DLD Trustee Office.

─────────────────────────────────────────────────
SIGNATURES
─────────────────────────────────────────────────
Seller: _________________________  Date: __________
Broker: _________________________  Date: __________

© RERA – Dubai Real Estate Regulatory Agency`,
    };
  }

  if (type === "B") {
    return {
      title: "Form B – Buyer's Agreement",
      body: `FORM B – BUYER'S AGREEMENT BETWEEN BROKER AND BUYER
(Real Estate Regulatory Agency – RERA, Dubai)

Date: ${date}
Location: ${location}

─────────────────────────────────────────────────
1. BROKERAGE COMPANY
─────────────────────────────────────────────────
Company Name: ${v(d.brokerAgency)}
ORN: ${v(d.brokerAgencyLicense)}
Broker Name: ${v(d.brokerName)}
BRN: ${v(d.brokerId)}
Phone: ${v(d.brokerPhone)}
Email: ${v(d.brokerEmail)}

─────────────────────────────────────────────────
2. BUYER
─────────────────────────────────────────────────
Full Name: ${v(d.buyerName)}
Nationality: ${v(d.buyerNationality)}
Passport No: ${v(d.buyerPassport)}
Emirates ID: ${v(d.buyerEmiratesId)}
Phone: ${v(d.buyerPhone)}
Email: ${v(d.buyerEmail)}

─────────────────────────────────────────────────
3. PROPERTY SEARCH CRITERIA
─────────────────────────────────────────────────
Community / Area: ${v(d.community)}
Property Type: ${v(d.propertyType)}
Bedrooms: ${v(d.bedrooms)}
Budget: ${fmtAed(d.salePrice)}

─────────────────────────────────────────────────
4. COMMISSION TERMS
─────────────────────────────────────────────────
Commission: ${v(d.commissionPct)}% of purchase price (+ 5% VAT)
Payable on DLD transfer completion at the Trustee Office.

─────────────────────────────────────────────────
5. BUYER DECLARATIONS
─────────────────────────────────────────────────
• Buyer appoints the above Broker to source and facilitate property
  purchase in Dubai.
• Buyer undertakes not to bypass the Broker for any property introduced
  by the Broker during the term of this agreement.

─────────────────────────────────────────────────
SIGNATURES
─────────────────────────────────────────────────
Buyer:  _________________________  Date: __________
Broker: _________________________  Date: __________

© RERA – Dubai Real Estate Regulatory Agency`,
    };
  }

  if (type === "F") {
    return {
      title: "Form F – Contract F (MOU)",
      body: `FORM F – MEMORANDUM OF UNDERSTANDING (CONTRACT F)
Between Buyer and Seller via Real Estate Broker(s)
(Real Estate Regulatory Agency – RERA, Dubai)

Date: ${date}
Location: ${location}

─────────────────────────────────────────────────
1. PARTIES
─────────────────────────────────────────────────
SELLER
Name: ${v(d.sellerName)}
Nationality: ${v(d.sellerNationality)}
Passport No: ${v(d.sellerPassport)}
Emirates ID: ${v(d.sellerEmiratesId)}
Phone: ${v(d.sellerPhone)}

BUYER
Name: ${v(d.buyerName)}
Nationality: ${v(d.buyerNationality)}
Passport No: ${v(d.buyerPassport)}
Emirates ID: ${v(d.buyerEmiratesId)}
Phone: ${v(d.buyerPhone)}

BROKER(S)
Agency: ${v(d.brokerAgency)} (ORN ${v(d.brokerAgencyLicense)})
Agent: ${v(d.brokerName)} (BRN ${v(d.brokerId)})
Phone: ${v(d.brokerPhone)}

─────────────────────────────────────────────────
2. PROPERTY
─────────────────────────────────────────────────
Property: ${v(d.propertyName)}
Address: ${v(d.propertyAddress)}
Community: ${v(d.community)}
Type: ${v(d.propertyType)} | Bedrooms: ${v(d.bedrooms)} | Size: ${v(d.size)} sqft
Title Deed No: ${v(d.titleDeedNumber)}
Makani No: ${v(d.makaniNumber)}
DLD Permit No: ${v(d.dldPermitNumber)}

─────────────────────────────────────────────────
3. TRANSACTION TERMS
─────────────────────────────────────────────────
Total Sale Price: ${fmtAed(d.salePrice)}
Deposit (10% or as agreed): ${fmtAed(d.depositAmount)}
  Paid via Manager's Cheque held by Broker as stakeholder until
  transfer completion.

Balance payable at DLD Trustee Office on transfer date.
Target Transfer Date: ${v(d.completionDate)}

─────────────────────────────────────────────────
4. COMMISSION
─────────────────────────────────────────────────
Buyer Side: ${v(d.commissionPct)}% + 5% VAT, payable by Buyer on transfer.
Seller Side: as per Form A, payable by Seller on transfer.

─────────────────────────────────────────────────
5. OBLIGATIONS
─────────────────────────────────────────────────
• Seller obtains Developer NOC at their cost.
• Buyer arranges financing (cash / mortgage pre-approval letter).
• Parties attend DLD Trustee Office for transfer on target date.
• If Buyer defaults: deposit forfeited to Seller.
• If Seller defaults: deposit refunded + equal amount penalty.

─────────────────────────────────────────────────
SIGNATURES
─────────────────────────────────────────────────
Seller:        _______________________  Date: __________
Buyer:         _______________________  Date: __________
Broker:        _______________________  Date: __________
Witness:       _______________________  Date: __________

© RERA – Dubai Real Estate Regulatory Agency`,
    };
  }

  if (type === "I") {
    return {
      title: "Form I – Unilateral Notification",
      body: `FORM I – UNILATERAL NOTIFICATION (SINGLE AGENCY)
(Real Estate Regulatory Agency – RERA, Dubai)

Date: ${date}

I, ${v(d.sellerName)} (Passport ${v(d.sellerPassport)}), hereby notify
that I have appointed the following as my sole and exclusive broker
for the listing, marketing, and sale of the property described below:

Broker Agency: ${v(d.brokerAgency)}
ORN: ${v(d.brokerAgencyLicense)}
Broker Name: ${v(d.brokerName)}
BRN: ${v(d.brokerId)}

Property: ${v(d.propertyName)}
Address: ${v(d.propertyAddress)}
Title Deed No: ${v(d.titleDeedNumber)}

Listing Price: ${fmtAed(d.salePrice)}
Exclusivity Period: ${v(d.listingPeriod)}

During this period no other broker is authorised to market this
property. Signed under the provisions of RERA Exclusive Agency rules.

Seller Signature: _________________________  Date: __________

© RERA – Dubai Real Estate Regulatory Agency`,
    };
  }

  // Form U
  return {
    title: "Form U – Termination Notice",
    body: `FORM U – TERMINATION OF BROKERAGE AGREEMENT
(Real Estate Regulatory Agency – RERA, Dubai)

Date: ${date}

To: ${v(d.brokerAgency)} (ORN ${v(d.brokerAgencyLicense)})
From: ${v(d.sellerName || d.buyerName)}

This letter serves as formal notice of termination of the brokerage
agreement dated __________ between the undersigned and the above
brokerage for the property:

Property: ${v(d.propertyName)}
Title Deed No: ${v(d.titleDeedNumber)}

Reason for termination: ________________________________________

All rights and obligations under the agreement cease effective
from the date of this notice.

Signature: _________________________
Name: ${v(d.sellerName || d.buyerName)}
Date: __________

© RERA – Dubai Real Estate Regulatory Agency`,
  };
}
