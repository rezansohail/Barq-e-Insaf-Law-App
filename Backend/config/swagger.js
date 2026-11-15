/**
 * OpenAPI 3.0 Specification for Barq-e-Insaf Judicial Tech Platform
 * Groups all endpoints neatly by controller with full 'Try it out' live testing support.
 */

const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: ' Barq-e-Insaf API Documentation & Testing Platform',
    version: '2.0.0',
    description: `
**Barq-e-Insaf (Lightning Justice)** is an AI-powered legal empowerment ecosystem designed for Sindh, Pakistan.
This interactive Swagger documentation allows you to test every API endpoint live against the **Neon PostgreSQL** database.

### Portal Architecture & Roles:
*  **Citizens:** File cases, upload encrypted evidence vault items, request lawyer consultations.
*  **Lawyers:** Sindh Bar Council (SBC) verified advocates accepting court briefs.
*  **NGOs (NCHD):** Institutional legal aid monitoring and human development representation.
*  **Media (KTN News):** Investigative journalism desk, court dockets, and live Sindh district dispute heatmaps.
*  **Super Admin:** Advocate license verifications, case queue management, platform health.
    `,
    contact: {
      name: 'Barq-e-Insaf Engineering Team',
      email: 'tech@barqeinsaf.gov.pk',
    },
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Local Development Server',
    },
    {
      url: 'http://192.168.100.246:5000',
      description: 'Local Network IP (Expo Go Physical Devices)',
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your 30-day JWT token obtained from any login or registration response.',
      },
    },
  },
  tags: [
    { name: '1. Citizen Controller', description: 'Citizen registration, authentication, cases, encrypted vault, consultations, and directories' },
    { name: '2. Lawyer Controller', description: 'SBC Bar License verification, advocate profiles, schedule, and case management' },
    { name: '3. Media Controller', description: 'KTN News portal: Live Sindh district dispute heatmap, public court dockets, stories & whistleblower leads' },
    { name: '4. NGO Controller', description: 'Institutional Legal Aid desk: NCHD organization profile, directory & case monitoring' },
    { name: '5. Cases Controller', description: 'Case creation, evidence updates, court schedules, and status tracking' },
    { name: '6. Admin Controller', description: 'Advocate verification queues, system-wide metrics, and administrative oversight' },
    { name: '7. Auth Controller', description: 'Token validation and cross-portal session verification' },
  ],
  paths: {
    // ══════════════════════════════════════════════════════════════════════
    // 1. CITIZEN CONTROLLER
    // ══════════════════════════════════════════════════════════════════════
    '/api/citizens/register': {
      post: {
        tags: ['1. Citizen Controller'],
        summary: 'Register a new Citizen',
        description: 'Creates a citizen record in `users` and initializes their profile.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['fullName', 'email', 'password', 'phone', 'district'],
                properties: {
                  fullName: { type: 'string', example: 'Zainab Bibi' },
                  email: { type: 'string', example: 'zainab.bibi@gmail.com' },
                  password: { type: 'string', example: 'Zainab@12345' },
                  confirmPassword: { type: 'string', example: 'Zainab@12345' },
                  phone: { type: 'string', example: '03001234567' },
                  district: { type: 'string', example: 'Karachi South' },
                  cnic: { type: 'string', example: '42101-1234567-1' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Citizen registered successfully with token' },
          400: { description: 'Validation error' },
          409: { description: 'Email already registered' },
        },
      },
    },
    '/api/citizens/login': {
      post: {
        tags: ['1. Citizen Controller'],
        summary: 'Citizen Login',
        description: 'Authenticates a citizen with email and password.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'zainab.bibi@gmail.com' },
                  password: { type: 'string', example: 'Zainab@12345' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Login successful' },
          401: { description: 'Invalid email or password' },
        },
      },
    },
    '/api/citizens/me': {
      get: {
        tags: ['1. Citizen Controller'],
        summary: 'Get Current Authenticated Citizen',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'Profile of current authenticated citizen' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/citizens/{id}': {
      get: {
        tags: ['1. Citizen Controller'],
        summary: 'Get Citizen Dashboard by ID',
        description: 'Returns profile details, active case counts, pending case counts, and consultations.',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, example: 6 },
        ],
        responses: {
          200: { description: 'Citizen dashboard details & stats' },
          404: { description: 'Citizen not found' },
        },
      },
      put: {
        tags: ['1. Citizen Controller'],
        summary: 'Update Citizen Profile',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, example: 6 },
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  fullName: { type: 'string', example: 'Zainab Bibi' },
                  phone: { type: 'string', example: '03001234567' },
                  district: { type: 'string', example: 'Karachi South' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Citizen updated successfully' },
        },
      },
    },
    '/api/citizens/{id}/cases': {
      get: {
        tags: ['1. Citizen Controller'],
        summary: 'Get All Cases for Citizen',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, example: 6 },
        ],
        responses: {
          200: { description: 'List of registered cases' },
        },
      },
      post: {
        tags: ['1. Citizen Controller'],
        summary: 'Create a New Legal Case for Citizen',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, example: 6 },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'type', 'district'],
                properties: {
                  title: { type: 'string', example: 'Land demarcation dispute in Scheme 33' },
                  type: { type: 'string', example: 'Property & Land Dispute' },
                  description: { type: 'string', example: 'Ancestral land demarcation dispute. Construction stopped by illegal occupants.' },
                  district: { type: 'string', example: 'Karachi' },
                  court: { type: 'string', example: 'District Court' },
                  lawyerId: { type: 'integer', example: 3 },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Case created successfully' },
        },
      },
    },
    '/api/citizens/{id}/cases/{caseId}': {
      put: {
        tags: ['1. Citizen Controller'],
        summary: 'Update / Edit Citizen Case',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, example: 6 },
          { name: 'caseId', in: 'path', required: true, schema: { type: 'integer' }, example: 3 },
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string', example: 'Updated Land demarcation dispute' },
                  description: { type: 'string', example: 'Updated hearing notes and legal notices served.' },
                  court: { type: 'string', example: 'Sindh High Court' },
                  status: { type: 'string', example: 'active' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Case updated' },
        },
      },
    },
    '/api/citizens/{id}/cases/{caseId}/media-request': {
      post: {
        tags: ['1. Citizen Controller'],
        summary: 'Request Media Investigative Coverage & Whistleblower Support',
        description: 'Enables a citizen facing legal issues to request journalism coverage and public interest broadcast from KTN News.',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, example: 6 },
          { name: 'caseId', in: 'path', required: true, schema: { type: 'integer' }, example: 5 },
        ],
        requestBody: {
          required: false,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  allowContact: { type: 'boolean', example: true, description: 'Allow KTN News Bureau to reach out via secure anonymous relay' },
                  notes: { type: 'string', example: 'Land grabbing syndicate ignoring stay order from court, urgent reporting needed.' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Media coverage requested successfully' },
        },
      },
    },
    '/api/citizens/{id}/cases/{caseId}/ngo-request': {
      post: {
        tags: ['1. Citizen Controller'],
        summary: 'Request Pro-Bono Legal Aid & Human Rights Protection from NCHD',
        description: 'Enables an underprivileged citizen or vulnerable litigant to formally request institutional pro-bono aid from NCHD.',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, example: 6 },
          { name: 'caseId', in: 'path', required: true, schema: { type: 'integer' }, example: 5 },
        ],
        requestBody: {
          required: false,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  allowContact: { type: 'boolean', example: true, description: 'Allow NCHD human development officers to contact via secure relay' },
                  notes: { type: 'string', example: 'Vulnerable family unable to afford lawyer fees, urgent pro-bono defense required.' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Legal aid requested successfully' },
        },
      },
    },
    '/api/citizens/{id}/consultations': {
      get: {
        tags: ['1. Citizen Controller'],
        summary: 'Get Consultations Requested by Citizen',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, example: 6 },
        ],
        responses: {
          200: { description: 'List of consultations' },
        },
      },
      post: {
        tags: ['1. Citizen Controller'],
        summary: 'Request Consultation with a Lawyer',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, example: 6 },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['lawyerId', 'caseType'],
                properties: {
                  lawyerId: { type: 'integer', example: 3 },
                  caseType: { type: 'string', example: 'Property Law' },
                  notes: { type: 'string', example: 'Need consultation regarding title deed verification' },
                  preferredDate: { type: 'string', example: '2026-11-20' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Consultation request sent' },
        },
      },
    },
    '/api/citizens/{id}/vault': {
      get: {
        tags: ['1. Citizen Controller'],
        summary: 'Get Citizen Encrypted Evidence Vault Items',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, example: 6 },
        ],
        responses: {
          200: { description: 'Vault documents and evidence files' },
        },
      },
      post: {
        tags: ['1. Citizen Controller'],
        summary: 'Add Document to Evidence Vault',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, example: 6 },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'category'],
                properties: {
                  name: { type: 'string', example: 'Sale_Deed_Registry.pdf' },
                  category: { type: 'string', example: 'Property Deed' },
                  caseId: { type: 'integer', example: 3 },
                  fileUrl: { type: 'string', example: 'https://barqeinsaf.s3.amazonaws.com/vault/deed.pdf' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Item added to vault' },
        },
      },
    },
    '/api/citizens/{id}/vault/{itemId}': {
      delete: {
        tags: ['1. Citizen Controller'],
        summary: 'Delete Item from Evidence Vault',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, example: 6 },
          { name: 'itemId', in: 'path', required: true, schema: { type: 'integer' }, example: 1 },
        ],
        responses: {
          200: { description: 'Vault item deleted' },
        },
      },
    },
    '/api/citizens/ngos': {
      get: {
        tags: ['1. Citizen Controller'],
        summary: 'Get Verified Legal Aid NGOs Directory',
        description: 'Returns verified NGOs (NCHD) available to assist citizens.',
        responses: {
          200: { description: 'List of active NGOs' },
        },
      },
    },
    '/api/citizens/media': {
      get: {
        tags: ['1. Citizen Controller'],
        summary: 'Get Verified Media Partners Directory',
        description: 'Returns media broadcast partners (KTN News) for public interest reporting.',
        responses: {
          200: { description: 'List of active media outlets' },
        },
      },
    },

    // ══════════════════════════════════════════════════════════════════════
    // 2. LAWYER CONTROLLER
    // ══════════════════════════════════════════════════════════════════════
    '/api/lawyers/register': {
      post: {
        tags: ['2. Lawyer Controller'],
        summary: 'Register a new Advocate (SBC Licensed)',
        description: 'Registers an advocate with Sindh Bar Council license credentials.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password', 'sbcNumber', 'district'],
                properties: {
                  name: { type: 'string', example: 'Advocate Tariq Hassan' },
                  email: { type: 'string', example: 'tariq.hassan@law.pk' },
                  password: { type: 'string', example: 'Tariq@12345' },
                  sbcNumber: { type: 'string', example: 'SBC-KHI-4892' },
                  specialty: { type: 'string', example: 'Civil & Land Dispute Law' },
                  district: { type: 'string', example: 'Karachi South' },
                  phone: { type: 'string', example: '03009988776' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Lawyer registered successfully' },
        },
      },
    },
    '/api/lawyers/login': {
      post: {
        tags: ['2. Lawyer Controller'],
        summary: 'Advocate Login',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'tariq.hassan@law.pk' },
                  password: { type: 'string', example: 'Tariq@12345' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Login successful with JWT token' },
          401: { description: 'Invalid credentials' },
        },
      },
    },
    '/api/lawyers': {
      get: {
        tags: ['2. Lawyer Controller'],
        summary: 'List / Search Verified Advocates',
        parameters: [
          { name: 'district', in: 'query', schema: { type: 'string' }, example: 'Karachi' },
          { name: 'specialty', in: 'query', schema: { type: 'string' }, example: 'Civil' },
        ],
        responses: {
          200: { description: 'List of active advocates' },
        },
      },
    },
    '/api/lawyers/{id}': {
      get: {
        tags: ['2. Lawyer Controller'],
        summary: 'Get Advocate Profile by ID',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, example: 3 },
        ],
        responses: {
          200: { description: 'Advocate profile details' },
        },
      },
    },
    '/api/lawyers/{id}/cases': {
      get: {
        tags: ['2. Lawyer Controller'],
        summary: 'Get Active Cases Assigned to Advocate',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, example: 3 },
        ],
        responses: {
          200: { description: 'Cases list' },
        },
      },
    },
    '/api/lawyers/{id}/consultations': {
      get: {
        tags: ['2. Lawyer Controller'],
        summary: 'Get Citizen Consultation Requests for Advocate',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, example: 3 },
        ],
        responses: {
          200: { description: 'Pending and scheduled consultations' },
        },
      },
    },

    // ══════════════════════════════════════════════════════════════════════
    // 3. MEDIA CONTROLLER (KTN NEWS)
    // ══════════════════════════════════════════════════════════════════════
    '/api/media/register': {
      post: {
        tags: ['3. Media Controller'],
        summary: 'Register a New Media Partner',
        description: 'Creates a media entity strictly in the `media` table with `role: media`.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['fullName', 'email', 'password', 'phone', 'district'],
                properties: {
                  fullName: { type: 'string', example: 'KTN News' },
                  channelName: { type: 'string', example: 'KTN News' },
                  resourcePerson: { type: 'string', example: 'Bureau Chief KTN News' },
                  email: { type: 'string', example: 'contact@ktnnews.tv' },
                  phone: { type: 'string', example: '021-3587654' },
                  district: { type: 'string', example: 'Sindh' },
                  password: { type: 'string', example: 'Ktn@12345' },
                  confirmPassword: { type: 'string', example: 'Ktn@12345' },
                  mediaType: { type: 'string', example: 'Sindhi / National News Channel' },
                  registrationNumber: { type: 'string', example: 'PEMRA-KTN-1992' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Media registered successfully' },
        },
      },
    },
    '/api/media/login': {
      post: {
        tags: ['3. Media Controller'],
        summary: 'Media Partner Login (KTN News)',
        description: 'Authenticates strictly against the `media` table and issues a media token.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'contact@ktnnews.tv' },
                  password: { type: 'string', example: 'Ktn@12345' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Media login successful' },
          401: { description: 'Invalid credentials' },
        },
      },
    },
    '/api/media/me': {
      get: {
        tags: ['3. Media Controller'],
        summary: 'Get Authenticated Media Profile',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'Media channel profile' },
        },
      },
    },
    '/api/media': {
      get: {
        tags: ['3. Media Controller'],
        summary: 'Get All Active Media Partners',
        responses: {
          200: { description: 'List of media organizations' },
        },
      },
    },
    '/api/media/analytics/heatmap': {
      get: {
        tags: ['3. Media Controller'],
        summary: 'Live Sindh Judicial Dispute Heatmap & Geographic Analytics',
        description: 'Calculates real-time case density across all Sindh districts from Neon PostgreSQL. Returns case count, percentage, severity shading (Red = High hotspot, Amber = Moderate, Green = Low), beat categories breakdown, and live map pointers.',
        parameters: [
          { name: 'range', in: 'query', schema: { type: 'string', enum: ['This Week', 'This Month', 'Q4 2026', 'Full Year'] }, example: 'This Month' },
        ],
        responses: {
          200: { description: 'Real-time Sindh judicial map and district dispute analytics' },
        },
      },
    },
    '/api/media/docket': {
      get: {
        tags: ['3. Media Controller'],
        summary: 'Public Judicial Court Docket (100% Anonymized for Journalists)',
        description: 'Returns real active cases across Sindh courts. Strictly protects citizen privacy by stripping all names, phones, CNICs, and personal emails, exposing only public legal dispute facts.',
        parameters: [
          { name: 'district', in: 'query', schema: { type: 'string' }, example: 'Karachi Central' },
          { name: 'type', in: 'query', schema: { type: 'string' }, example: 'Property' },
          { name: 'status', in: 'query', schema: { type: 'string' }, example: 'active' },
          { name: 'mediaRequestedOnly', in: 'query', schema: { type: 'boolean' }, example: false },
        ],
        responses: {
          200: { description: 'Anonymized court docket records' },
        },
      },
    },
    '/api/media/leads': {
      get: {
        tags: ['3. Media Controller'],
        summary: 'Citizen Whistleblower & Media Coverage Requests',
        description: 'Retrieves disputes where citizens facing legal oppression have flagged their case requesting investigative reporting and news coverage from KTN News.',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'district', in: 'query', schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['pending_review', 'under_investigation', 'covered', 'rejected'] } },
        ],
        responses: {
          200: { description: 'List of citizen media leads' },
        },
      },
    },
    '/api/media/cases/{caseId}/status': {
      put: {
        tags: ['3. Media Controller'],
        summary: 'Update Case Media Coverage Status',
        description: 'Allows KTN News reporters/editors to accept a lead, mark it under investigation, or broadcast covered.',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'caseId', in: 'path', required: true, schema: { type: 'integer' }, example: 5 },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: {
                  status: { type: 'string', enum: ['pending_review', 'under_investigation', 'covered', 'rejected', 'archived'], example: 'under_investigation' },
                  notes: { type: 'string', example: 'Dispute assigned to senior legal affairs correspondent for ground reporting.' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Media status updated' },
        },
      },
    },
    '/api/media/stories': {
      get: {
        tags: ['3. Media Controller'],
        summary: 'Get Published Investigative Media Stories',
        description: 'Returns published judicial reports, investigative stories, and broadcast press releases.',
        parameters: [
          { name: 'district', in: 'query', schema: { type: 'string' }, example: 'Karachi Central' },
          { name: 'category', in: 'query', schema: { type: 'string' }, example: 'Property' },
          { name: 'isBreaking', in: 'query', schema: { type: 'boolean' }, example: false },
        ],
        responses: {
          200: { description: 'List of published stories' },
        },
      },
      post: {
        tags: ['3. Media Controller'],
        summary: 'Publish an Investigative Journalism Story',
        description: 'Publishes an official news story or judicial investigation into the Barq-e-Insaf broadcast news feed.',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'summary', 'district'],
                properties: {
                  title: { type: 'string', example: 'Investigation: Land Grabbing Nexus in Scheme 33 Exposed' },
                  summary: { type: 'string', example: 'KTN News investigation reveals unauthorized land demarcations violating Sindh High Court stay orders.' },
                  district: { type: 'string', example: 'Karachi Central' },
                  category: { type: 'string', example: 'Property & Land Rights' },
                  journalistName: { type: 'string', example: 'Rehan Shah (Legal Bureau Chief)' },
                  broadcastUrl: { type: 'string', example: 'https://ktnnews.tv/investigative/scheme33-land-grabbing' },
                  isBreaking: { type: 'boolean', example: true },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Media story published successfully' },
        },
      },
    },
    '/api/media/stories/{id}': {
      get: {
        tags: ['3. Media Controller'],
        summary: 'Get Media Story by ID',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, example: 1 },
        ],
        responses: {
          200: { description: 'Media story details' },
          404: { description: 'Story not found' },
        },
      },
    },
    '/api/media/reports/export': {
      post: {
        tags: ['3. Media Controller'],
        summary: 'Compile & Export Press Packet Report',
        description: 'Generates broadcast-ready media documentation in PDF, CSV, or JSON formats complying with journalistic standards.',
        requestBody: {
          required: false,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  format: { type: 'string', enum: ['PDF', 'CSV', 'JSON'], example: 'PDF' },
                  anonymizeLitigants: { type: 'boolean', example: true },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Press report generated' },
        },
      },
    },

    // ══════════════════════════════════════════════════════════════════════
    // 4. NGO CONTROLLER (NCHD)
    // ══════════════════════════════════════════════════════════════════════
    '/api/ngo/register': {
      post: {
        tags: ['4. NGO Controller'],
        summary: 'Register a New NGO',
        description: 'Creates an institutional NGO record strictly in the `ngos` table with `role: ngo`.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['fullName', 'email', 'password', 'phone', 'district'],
                properties: {
                  fullName: { type: 'string', example: 'National Commission for Human Development (NCHD)' },
                  resourcePerson: { type: 'string', example: 'Abdul Wajid Shaikh (Director NCHD)' },
                  email: { type: 'string', example: 'contact@nchd.org.pk' },
                  phone: { type: 'string', example: '021-99201234' },
                  district: { type: 'string', example: 'Sindh' },
                  password: { type: 'string', example: 'Nchd@12345' },
                  confirmPassword: { type: 'string', example: 'Nchd@12345' },
                  organizationType: { type: 'string', example: 'Human Development / Legal Aid' },
                  registrationNumber: { type: 'string', example: 'NCHD-FED-2002' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'NGO registered successfully' },
        },
      },
    },
    '/api/ngo/login': {
      post: {
        tags: ['4. NGO Controller'],
        summary: 'NGO Login (NCHD)',
        description: 'Authenticates strictly against the `ngos` table and issues an NGO token.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'contact@nchd.org.pk' },
                  password: { type: 'string', example: 'Nchd@12345' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'NGO login successful' },
        },
      },
    },
    '/api/ngo/me': {
      get: {
        tags: ['4. NGO Controller'],
        summary: 'Get Authenticated NGO Profile',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'NGO profile' },
        },
      },
    },
    '/api/ngo': {
      get: {
        tags: ['4. NGO Controller'],
        summary: 'Get All Active NGOs',
        responses: {
          200: { description: 'List of active NGOs' },
        },
      },
    },
    '/api/ngo/analytics/heatmap': {
      get: {
        tags: ['4. NGO Controller'],
        summary: 'Real-time Sindh Judicial Dispute Heatmap for NCHD',
        description: 'Calculates real-time case density across all Sindh districts from Neon PostgreSQL. Returns case count, percentage, severity shading (Red = High hotspot, Amber = Moderate, Green = Low), beat categories breakdown, and live map pointers.',
        parameters: [
          { name: 'range', in: 'query', schema: { type: 'string', enum: ['This Week', 'This Month', 'Q4 2026', 'Full Year'] }, example: 'This Month' },
        ],
        responses: {
          200: { description: 'Real-time Sindh judicial map and district dispute analytics for NCHD' },
        },
      },
    },
    '/api/ngo/docket': {
      get: {
        tags: ['4. NGO Controller'],
        summary: 'Public Court Docket for NCHD (100% Anonymized)',
        description: 'Returns real active cases across Sindh courts. Strictly protects citizen privacy by stripping all names, phones, CNICs, and personal emails, exposing only public dispute facts and legal aid eligibility.',
        parameters: [
          { name: 'district', in: 'query', schema: { type: 'string' }, example: 'Karachi Central' },
          { name: 'type', in: 'query', schema: { type: 'string' }, example: 'Property' },
          { name: 'status', in: 'query', schema: { type: 'string' }, example: 'active' },
          { name: 'aidRequestedOnly', in: 'query', schema: { type: 'boolean' }, example: false },
        ],
        responses: {
          200: { description: 'Anonymized court docket records' },
        },
      },
    },
    '/api/ngo/leads': {
      get: {
        tags: ['4. NGO Controller'],
        summary: 'Citizen Pro-Bono Legal Aid & Human Rights Requests',
        description: 'Retrieves disputes where citizens have requested institutional aid and pro-bono representation from NCHD.',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'district', in: 'query', schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['pending_review', 'assistance_offered', 'aid_assigned', 'in_progress', 'resolved', 'rejected'] } },
        ],
        responses: {
          200: { description: 'List of citizen legal aid requests' },
        },
      },
    },
    '/api/ngo/cases/{caseId}/offer-assistance': {
      post: {
        tags: ['4. NGO Controller'],
        summary: 'Proactive Outreach: NCHD Offers Legal Aid / Assistance to a Citizen',
        description: 'Allows NCHD officers to review an anonymized court dispute and proactively offer free pro-bono representation or human rights support without exposing the citizen identity.',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'caseId', in: 'path', required: true, schema: { type: 'integer' }, example: 5 },
        ],
        requestBody: {
          required: false,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  programName: { type: 'string', example: 'NCHD Pro-Bono Legal Empowerment Initiative' },
                  message: { type: 'string', example: 'NCHD Provincial Directorate has reviewed your case and assigned a pro-bono advocate panel to support your defense.' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Assistance offer dispatched successfully' },
        },
      },
    },
    '/api/ngo/cases/{caseId}/status': {
      put: {
        tags: ['4. NGO Controller'],
        summary: 'Update Case Legal Aid Status',
        description: 'Allows NCHD officers to assign counsel, mark aid in progress, or resolve assistance.',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'caseId', in: 'path', required: true, schema: { type: 'integer' }, example: 5 },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: {
                  status: { type: 'string', enum: ['pending_review', 'assistance_offered', 'aid_assigned', 'in_progress', 'resolved', 'rejected', 'archived'], example: 'aid_assigned' },
                  notes: { type: 'string', example: 'Pro-bono counsel assigned from NCHD Karachi Legal Cell.' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Aid status updated' },
        },
      },
    },
    '/api/ngo/stories': {
      get: {
        tags: ['4. NGO Controller'],
        summary: 'Get Published NGO Human Development Stories',
        description: 'Returns published community empowerment initiatives, feeder school rights campaigns, and pro-bono aid field stories.',
        parameters: [
          { name: 'district', in: 'query', schema: { type: 'string' }, example: 'Sukkur' },
          { name: 'category', in: 'query', schema: { type: 'string' }, example: 'Legal Aid & Human Rights' },
          { name: 'isFeatured', in: 'query', schema: { type: 'boolean' }, example: false },
        ],
        responses: {
          200: { description: 'List of published NGO stories' },
        },
      },
      post: {
        tags: ['4. NGO Controller'],
        summary: 'Publish an NGO Human Development / Field Story',
        description: 'Publishes an official human development milestone, community legal aid awareness drive, or rehabilitation story to the Barq-e-Insaf feed.',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'summary', 'district'],
                properties: {
                  title: { type: 'string', example: 'NCHD Legal Aid Clinic Resolves Rural Land Disputes in Sukkur' },
                  summary: { type: 'string', example: 'Through Barq-e-Insaf pro-bono panel, NCHD provided free legal representation to 14 marginalized families facing unlawful eviction.' },
                  district: { type: 'string', example: 'Sukkur' },
                  category: { type: 'string', example: 'Legal Aid & Human Rights' },
                  officerName: { type: 'string', example: 'Abdul Wajid Shaikh (Director NCHD)' },
                  programName: { type: 'string', example: 'NCHD Community Rights & Feeder School Empowerment' },
                  isFeatured: { type: 'boolean', example: true },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'NGO story published successfully' },
        },
      },
    },
    '/api/ngo/stories/{id}': {
      get: {
        tags: ['4. NGO Controller'],
        summary: 'Get NGO Story by ID',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, example: 1 },
        ],
        responses: {
          200: { description: 'NGO story details' },
          404: { description: 'Story not found' },
        },
      },
    },
    '/api/ngo/reports/export': {
      post: {
        tags: ['4. NGO Controller'],
        summary: 'Compile & Export Institutional NCHD Legal Aid Report',
        description: 'Generates institutional human development documentation in PDF, CSV, or JSON formats complying with statutory standards.',
        requestBody: {
          required: false,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  format: { type: 'string', enum: ['PDF', 'CSV', 'JSON'], example: 'PDF' },
                  anonymizeLitigants: { type: 'boolean', example: true },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Institutional report generated' },
        },
      },
    },

    // ══════════════════════════════════════════════════════════════════════
    // 5. CASES CONTROLLER
    // ══════════════════════════════════════════════════════════════════════
    '/api/cases': {
      get: {
        tags: ['5. Cases Controller'],
        summary: 'Get All Cases (System-wide or Filtered)',
        parameters: [
          { name: 'district', in: 'query', schema: { type: 'string' }, example: 'Karachi' },
          { name: 'status', in: 'query', schema: { type: 'string' }, example: 'active' },
        ],
        responses: {
          200: { description: 'List of cases' },
        },
      },
    },
    '/api/cases/{id}': {
      get: {
        tags: ['5. Cases Controller'],
        summary: 'Get Case Details by ID',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, example: 3 },
        ],
        responses: {
          200: { description: 'Case object' },
        },
      },
    },

    // ══════════════════════════════════════════════════════════════════════
    // 6. ADMIN CONTROLLER
    // ══════════════════════════════════════════════════════════════════════
    '/api/admin/login': {
      post: {
        tags: ['6. Admin Controller'],
        summary: 'Super Admin Login',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'anjumkalwar.cs@gmail.com' },
                  password: { type: 'string', example: 'Admin@12345' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Admin login successful' },
        },
      },
    },
    '/api/admin/stats': {
      get: {
        tags: ['6. Admin Controller'],
        summary: 'Platform-wide Analytics & Health Metrics',
        responses: {
          200: { description: 'Total counts of cases, lawyers, citizens, NGOs' },
        },
      },
    },

    // ══════════════════════════════════════════════════════════════════════
    // 7. AUTH CONTROLLER
    // ══════════════════════════════════════════════════════════════════════
    '/api/auth/verify': {
      get: {
        tags: ['7. Auth Controller'],
        summary: 'Verify Current JWT Token & Role Session',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'Token is valid' },
          401: { description: 'Invalid or expired token' },
        },
      },
    },
  },
};

module.exports = swaggerSpec;
