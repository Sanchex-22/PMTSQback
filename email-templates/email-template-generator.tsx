
// Email template generator function that creates the HTML for the professional quotation
import path from 'path';
import fs from 'fs';

const logoPath = path.join(process.cwd(), 'public', 'images', 'logo.png');
const logo = fs.readFileSync(logoPath).toString('base64');

export function generateQuotationEmailHTML(data: {
  name: string
  lastName: string
  document: string
  nationality: string
  email: string
  phone: string
  coursesWithPrices: any[]
  renewalCoursesWithPrices: any[]
  newCoursesTotal: number
  renewalCoursesTotal: number
  totalCost: number
  govInfo: any
  quotationNumber?: string
  date?: string
}) {
  const {
    name,
    lastName,
    document,
    nationality,
    email,
    phone,
    coursesWithPrices,
    renewalCoursesWithPrices,
    newCoursesTotal,
    renewalCoursesTotal,
    totalCost,
    govInfo,
    quotationNumber = `PMTS/Q/${new Date().getFullYear()}/${Math.floor(Math.random() * 10000)}`,
    date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
  } = data

  // Combine all courses for the table
  const allCourses = [
    ...coursesWithPrices.map((course, index) => ({
      ...course,
      displayName: course.name,
      number: index + 1,
    })),
    ...renewalCoursesWithPrices.map((course, index) => ({
      ...course,
      displayName: `${course.name} (Renewal)`,
      number: coursesWithPrices.length + index + 1,
    })),
  ]

  // Calculate government fee (you can adjust this logic)
  const governmentFee = totalCost * 0.05 // 5% government fee example
  const grandTotal = totalCost + governmentFee

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Maritime Training Quotation</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f7fa;">
      <div style="max-width: 800px; margin: 0 auto; background-color: #ffffff; color: #333333; line-height: 1.6;">
        
        <!-- Header -->
        <div style="background-color: #1e40af; color: white; padding: 30px 40px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="width: 120px; vertical-align: middle; padding-right: 20px;">
                <!-- Logo -->
                <img src="${logo ? `data:image/png;base64,${logo}` : '/placeholder.svg?...'}" alt="Company Logo" style="max-width: 120px; height: auto;" />
              </td>
              <td style="vertical-align: middle; text-align: left;">
                <h1 style="margin: 0 0 8px 0; font-size: 24px; font-weight: bold;">
                  Panama Maritime Training Services, Inc.
                </h1>
                <p style="margin: 0 0 16px 0; font-size: 16px; font-style: italic;">
                  Maritime Training Tailored to You
                </p>
                <div style="font-size: 14px; opacity: 0.9;">
                  <p style="margin: 4px 0;">77th Street, San Francisco, InterMaritime Building</p>
                  <p style="margin: 4px 0;">Phone: +(507) 395-2801 / +(507) 322-0013</p>
                </div>
              </td>
            </tr>
          </table>
        </div>

        <!-- Quotation Info and Participant Information Side by Side -->
        <div style="padding: 30px 40px 20px; border-bottom: 2px solid #e5e7eb;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="width: 50%; padding-right: 20px; vertical-align: top;">
                <h2 style="margin: 0 0 16px 0; font-size: 28px; color: #1e40af; font-weight: bold;">
                  QUOTATION #${quotationNumber}
                </h2>
                <div style="font-size: 14px;">
                  <p style="margin: 4px 0;"><strong>Number:</strong> ${quotationNumber}</p>
                  <p style="margin: 4px 0;"><strong>Date:</strong> ${date}</p>
                  <p style="margin: 4px 0;"><strong>Valid for:</strong> 45 days</p>
                  <p style="margin: 4px 0;"><strong>Prepared by:</strong> PMTS Team</p>
                </div>
              </td>
              <td style="width: 50%; padding-left: 20px; vertical-align: top;">
                <h3 style="margin: 0 0 16px 0; font-size: 18px; color: #374151; border-bottom: 1px solid #d1d5db; padding-bottom: 8px;">
                  PARTICIPANT'S INFORMATION
                </h3>
                <div style="font-size: 14px;">
                  <p style="margin: 6px 0;"><strong>Name:</strong> ${name.toUpperCase()} ${lastName.toUpperCase()}</p>
                  <p style="margin: 6px 0;"><strong>Nationality:</strong> ${nationality.toUpperCase()}</p>
                  <p style="margin: 6px 0;"><strong>Document:</strong> ${document}</p>
                  <p style="margin: 6px 0;"><strong>Email:</strong> ${email}</p>
                  <p style="margin: 6px 0;"><strong>Phone:</strong> ${phone}</p>
                  <p style="margin: 6px 0;"><strong>Government/Institution:</strong> ${govInfo.label}</p>
                </div>
              </td>
            </tr>
          </table>
        </div>

        <!-- Compact Services Table with Integrated Totals -->
        <div style="padding: 20px 40px;">
          <h3 style="margin: 0 0 16px 0; font-size: 18px; color: #374151; border-bottom: 1px solid #d1d5db; padding-bottom: 8px;">
            SERVICE DETAILS
          </h3>

          <table style="width: 100%; border-collapse: collapse; border: 1px solid #d1d5db; font-size: 13px;">
            <!-- Table Header -->
            <tr style="background-color: #f9fafb;">
              <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left; font-weight: bold;">NO.</th>
              <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left; font-weight: bold;">SERVICE DETAILS</th>
              <th style="border: 1px solid #d1d5db; padding: 8px; text-align: center; font-weight: bold;">QTY</th>
              <th style="border: 1px solid #d1d5db; padding: 8px; text-align: right; font-weight: bold;">UNIT PRICE</th>
              <th style="border: 1px solid #d1d5db; padding: 8px; text-align: right; font-weight: bold;">PRICE</th>
            </tr>

            <!-- Service Rows -->
            ${allCourses
              .map(
                (course, index) => `
            <tr style="background-color: ${index % 2 === 0 ? "#ffffff" : "#f9fafb"};">
              <td style="border: 1px solid #e5e7eb; padding: 8px; font-weight: bold;">${course.number}</td>
              <td style="border: 1px solid #e5e7eb; padding: 8px;">
                ${course.displayName}
                ${course.abbr ? `<br><small style="color: #6b7280;">Code: ${course.abbr}</small>` : ""}
                ${course.imo_no ? `<br><small style="color: #6b7280;">IMO: ${course.imo_no}</small>` : ""}
              </td>
              <td style="border: 1px solid #e5e7eb; padding: 8px; text-align: center;">1</td>
              <td style="border: 1px solid #e5e7eb; padding: 8px; text-align: right;">$${course.finalPrice.toFixed(2)}</td>
              <td style="border: 1px solid #e5e7eb; padding: 8px; text-align: right; font-weight: bold;">$${course.finalPrice.toFixed(2)}</td>
            </tr>
            `,
              )
              .join("")}

            <!-- Subtotal Row -->
            <tr style="background-color: #f3f4f6;">
              <td colspan="4" style="border: 1px solid #d1d5db; padding: 8px; text-align: right; font-weight: bold;">Sub Total</td>
              <td style="border: 1px solid #d1d5db; padding: 8px; text-align: right; font-weight: bold;">$${totalCost.toFixed(2)}</td>
            </tr>

            <!-- Government Fee Row -->
            <tr style="background-color: #f3f4f6;">
              <td colspan="4" style="border: 1px solid #d1d5db; padding: 8px; text-align: right; font-weight: bold;">Certificate Government Fee</td>
              <td style="border: 1px solid #d1d5db; padding: 8px; text-align: right; font-weight: bold;">$</td>
            </tr>

            <!-- Grand Total Row -->
            <tr style="background-color: #1e40af; color: white;">
              <td colspan="4" style="border: 1px solid #1e40af; padding: 12px; text-align: right; font-weight: bold; font-size: 16px;">Grand Total</td>
              <td style="border: 1px solid #1e40af; padding: 12px; text-align: right; font-weight: bold; font-size: 16px;">$${totalCost.toFixed(2)}</td>
            </tr>

            ${
              govInfo.surcharge > 0
                ? `
            <!-- Surcharge Note Row -->
            <tr>
              <td colspan="5" style="border: 1px solid #d1d5db; padding: 8px; text-align: center; font-size: 11px; color: #6b7280; background-color: #f9fafb;">
                *Includes $${govInfo.surcharge} surcharge per course for ${govInfo.label}
              </td>
            </tr>
            `
                : ""
            }
          </table>
        </div>

        <!-- Payment Information -->
        <div style="padding: 20px 40px 40px;">
          <h3 style="margin: 0 0 16px 0; font-size: 18px; color: #374151; border-bottom: 1px solid #d1d5db; padding-bottom: 8px;">
            PAYMENT INFORMATION
          </h3>

          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr>
              <td style="width: 50%; padding-right: 10px; vertical-align: top;">
                <!-- Local Payment -->
                <div style="background-color: #f0f9ff; padding: 16px; border-radius: 8px; border: 1px solid #bae6fd; height: 100%; box-sizing: border-box;">
                  <h4 style="margin: 0 0 12px 0; color: #0369a1;">LOCAL PAYMENT INFO.</h4>
                  <div style="margin-bottom: 12px;">
                    <strong>BANCO BANISTMO</strong><br>
                    Panama Maritime Training Services, Inc.<br>
                    Bank Account Number: 0101090844<br>
                    Checking Account.
                  </div>
                  <div>
                    <strong>BANCO GENERAL</strong><br>
                    Panama Maritime Training Services, Inc.<br>
                    Bank Account Number: 03-29-01-025184-0<br>
                    Checking Account.
                  </div>
                </div>
              </td>
              <td style="width: 50%; padding-left: 10px; vertical-align: top;">
                <!-- International Payment -->
                <div style="background-color: #f0fdf4; padding: 16px; border-radius: 8px; border: 1px solid #bbf7d0; height: 100%; box-sizing: border-box;">
                  <h4 style="margin: 0 0 12px 0; color: #166534;">PAYMENT INFO. ABROAD</h4>
                  <div style="margin-bottom: 8px;">
                    <strong>Beneficiary Account:</strong><br>
                    PANAMA MARITIME TRAINING SERVICES, INC.<br>
                    BANK ACCOUNT NUMBER: 03-29-01-025184-0<br>
                    Address: 77th Street Bldg. 26 Panama City, Republic of Panama<br>
                    PH: +(507)322-0013
                  </div>
                  <div style="margin-bottom: 8px;">
                    <strong>Beneficiary Bank:</strong><br>
                    BANCO GENERAL, S.A. - PANAMA<br>
                    Swift Code: BAGEPAPA<br>
                    Address: Aquilino de la Guardia Street and Ave. 5 B Sur<br>
                    Panama City, Republic of Panama
                  </div>
                  <div>
                    <strong>Intermediary Bank:</strong><br>
                    CITIBANK NEW YORK, N.Y.<br>
                    Account No.: 10951934<br>
                    SWIFT Code: CITIUS33<br>
                    ABA # 021000089<br>
                    Address: 111 Wall Street New York, NY 10043<br>
                    Phone: +1 917-746-1193
                  </div>
                </div>
              </td>
            </tr>
          </table>
        </div>

        <!-- Footer -->
        <div style="background-color: #f9fafb; padding: 20px 40px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0;">
            This quotation is valid for 45 days. Please contact us for any questions or clarifications.
          </p>
            <p style="margin: 4px 0;">Phone: +(507) 395-2801 / +(507) 322-0013</p>
            <p style="margin: 4px 0;">Email: info@panamamaritimetraining.com</p>
            <p style="margin: 4px 0;">Web: www.panamamaritimetraining.com</p>
        </div>
      </div>
    </body>
    </html>
  `
}
