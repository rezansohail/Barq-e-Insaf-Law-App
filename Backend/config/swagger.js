/**
 * Barq-e-Insaf OpenAPI 3.0 / Swagger Specification
 * Comprehensive interactive API documentation & testing configuration
 * Covers Citizen, SBC Lawyer, Sindh Bar Council Admin, NGO (NCHD), Media (KTN), and Legal Cases
 */

const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Barq-e-Insaf Complete API Platform',
    version: '2.0.0',
    description: `
**Barq-e-Insaf Legal Tech Platform** complete REST API Server powered by Neon PostgreSQL.
Provides endpoints across all portals:
- **Citizens**: Registration, authentication, case filing, pro-bono aid requests, evidence vault, advocate consultations.
- **Lawyers**: Sindh Bar Council roster, advocate licensing, client consultation requests, active case docket, office schedule.
- **Admin Governance**: Sindh Bar Council oversight, platform ecosystem monitoring, citizen/lawyer/ngo/media management, status moderation, audit logs, notifications.
- **NGO (NCHD)**: Legal aid outreach, pro-bono case assistance, public docket, provincial heatmap, community stories, PDF reports.
- **Media (KTN News)**: Journalism desk, citizen leads, public docket, investigative stories, press export.
- **Legal Cases**: Core judicial dispatch docket, status lifecycle, advocate assignment.
    `,
    contact: {
      name: 'Barq-e-Insaf Engineering Team',
      email: 'support@barqeinsaf.pk'
    }
  },
  servers: [
    {
      url: 'http://localhost:5000/api',
      description: 'Local Node.js Development Server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your 30-day JWT token obtained from any login or registration endpoint.'
      }
    }
  },
  tags: [
    { name: '1. Citizen Controller', description: 'Citizen registration, authentication, cases, legal vault, consultations, and requests' },
    { name: '2. Lawyer Controller', description: 'SBC Advocate portal, licensing, intake cases, schedule, and consultations' },
    { name: '3. Admin Controller', description: 'Sindh Bar Council administrative governance, ecosystem monitoring, account management & audit logs' },
    { name: '4. NGO Controller', description: 'NCHD Legal Aid, pro-bono assistance, community stories, reports, and case heatmaps' },
    { name: '5. Media Controller', description: 'KTN News Journalism desk, broadcast stories, investigative leads, and press reports' },
    { name: '6. Case Controller', description: 'Core legal case docket, dispatch, assignment, and status lifecycle' }
  ],
  paths: {
    // =========================================================================
    // 1. CITIZEN CONTROLLER
    // =========================================================================
    '/citizens/register': {
      post: {
        tags: ['1. Citizen Controller'],
        summary: 'Register a new citizen account',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['fullName', 'email', 'phone', 'district', 'password'],
                properties: {
                  fullName: { type: 'string', example: 'Ahmed Ali' },
                  email: { type: 'string', example: 'ahmed@barqeinsaf.pk' },
                  phone: { type: 'string', example: '03001234567' },
                  district: { type: 'string', example: 'Karachi Central' },
                  password: { type: 'string', example: 'SecurePass@123' },
                  cnic: { type: 'string', example: '42101-1234567-1' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Citizen created successfully' },
          400: { description: 'Validation error' }
        }
      }
    },
    '/citizens/login': {
      post: {
        tags: ['1. Citizen Controller'],
        summary: 'Login citizen via email or phone',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['password'],
                properties: {
                  email: { type: 'string', example: 'ahmed@barqeinsaf.pk' },
                  identifier: { type: 'string', example: '03001234567' },
                  password: { type: 'string', example: 'SecurePass@123' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Login successful, returns JWT token' },
          401: { description: 'Invalid credentials' }
        }
      }
    },
    '/citizens/me': {
      get: {
        tags: ['1. Citizen Controller'],
        summary: 'Get authenticated citizen profile',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Profile details returned' }
        }
      }
    },
    '/citizens/{id}': {
      get: {
        tags: ['1. Citizen Controller'],
        summary: 'Get citizen profile by ID',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, example: 1 }
        ],
        responses: {
          200: { description: 'Citizen profile data' }
        }
      },
      put: {
        tags: ['1. Citizen Controller'],
        summary: 'Update citizen profile details',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, example: 1 }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  fullName: { type: 'string', example: 'Ahmed Ali Khan' },
                  phone: { type: 'string', example: '03001234567' },
                  city: { type: 'string', example: 'Karachi' },
                  district: { type: 'string', example: 'Karachi East' },
                  address: { type: 'string', example: 'Gulshan-e-Iqbal, Block 5' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Citizen profile updated' }
        }
      }
    },
    '/citizens/{id}/cases': {
      get: {
        tags: ['1. Citizen Controller'],
        summary: 'Get all cases for a specific citizen',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, example: 1 }
        ],
        responses: {
          200: { description: 'List of citizen cases' }
        }
      },
      post: {
        tags: ['1. Citizen Controller'],
        summary: 'File a new legal case intake for citizen',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, example: 1 }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'category', 'description'],
                properties: {
                  title: { type: 'string', example: 'Illegal Encroachment on Family Land' },
                  category: { type: 'string', example: 'Property' },
                  court: { type: 'string', example: 'District Court Karachi East' },
                  district: { type: 'string', example: 'Karachi East' },
                  description: { type: 'string', example: 'Dispute over inherited land plot measuring 400 sq yards.' },
                  hearingDate: { type: 'string', example: '2026-12-15' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Case created successfully' }
        }
      }
    },
    '/citizens/{id}/cases/{caseId}': {
      put: {
        tags: ['1. Citizen Controller'],
        summary: 'Update citizen case details',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
          { name: 'caseId', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  status: { type: 'string' },
                  hearingDate: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Case updated' }
        }
      }
    },
    '/citizens/{id}/cases/{caseId}/media-request': {
      post: {
        tags: ['1. Citizen Controller'],
        summary: 'Request media coverage (KTN News) for a case',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
          { name: 'caseId', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          200: { description: 'Media coverage requested' }
        }
      }
    },
    '/citizens/{id}/cases/{caseId}/ngo-request': {
      post: {
        tags: ['1. Citizen Controller'],
        summary: 'Request NGO legal aid (NCHD) for a case',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
          { name: 'caseId', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          200: { description: 'NGO legal aid requested' }
        }
      }
    },
    '/citizens/{id}/consultations': {
      get: {
        tags: ['1. Citizen Controller'],
        summary: 'Get citizen consultation bookings with SBC advocates',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          200: { description: 'List of consultations' }
        }
      },
      post: {
        tags: ['1. Citizen Controller'],
        summary: 'Book a legal consultation with an advocate',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['lawyerId', 'scheduledDate'],
                properties: {
                  lawyerId: { type: 'integer', example: 1 },
                  caseId: { type: 'integer', example: 1 },
                  scheduledDate: { type: 'string', example: '2026-11-25T10:00:00Z' },
                  notes: { type: 'string', example: 'Discussion regarding bail petition' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Consultation requested' }
        }
      }
    },
    '/citizens/{id}/vault': {
      get: {
        tags: ['1. Citizen Controller'],
        summary: 'Get encrypted documents from citizen Legal Vault',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          200: { description: 'List of encrypted vault records' }
        }
      },
      post: {
        tags: ['1. Citizen Controller'],
        summary: 'Upload and encrypt a document to Legal Vault',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'category'],
                properties: {
                  title: { type: 'string', example: 'Title Deed Registry Copy' },
                  category: { type: 'string', example: 'Property Documents' },
                  fileType: { type: 'string', example: 'pdf' },
                  fileUri: { type: 'string', example: 'file:///vault/deed_102.pdf' },
                  notes: { type: 'string', example: 'Certified true copy from Sub-Registrar' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Document stored in vault' }
        }
      }
    },
    '/citizens/{id}/vault/{itemId}': {
      delete: {
        tags: ['1. Citizen Controller'],
        summary: 'Delete a document from citizen Legal Vault',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
          { name: 'itemId', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          200: { description: 'Document removed from vault' }
        }
      }
    },
    '/citizens/ngos': {
      get: {
        tags: ['1. Citizen Controller'],
        summary: 'Browse accredited legal aid NGOs available to citizens',
        responses: {
          200: { description: 'List of NGOs' }
        }
      }
    },
    '/citizens/media': {
      get: {
        tags: ['1. Citizen Controller'],
        summary: 'Browse accredited media partners available to citizens',
        responses: {
          200: { description: 'List of media partners' }
        }
      }
    },

    // =========================================================================
    // 2. LAWYER CONTROLLER
    // =========================================================================
    '/lawyers/register': {
      post: {
        tags: ['2. Lawyer Controller'],
        summary: 'Register a new Sindh Bar Council Advocate',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'phone', 'sbcNumber', 'specialty', 'district', 'cnic', 'password'],
                properties: {
                  name: { type: 'string', example: 'Adv. Fatima Shah' },
                  email: { type: 'string', example: 'fatima.shah@sindhbar.gov.pk' },
                  phone: { type: 'string', example: '03331234567' },
                  sbcNumber: { type: 'string', example: 'SBC-4819' },
                  specialty: { type: 'string', example: 'Family & Property Law' },
                  district: { type: 'string', example: 'Karachi South' },
                  cnic: { type: 'string', example: '42301-7654321-3' },
                  password: { type: 'string', example: 'AdvocatePass@123' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Advocate registered and activated' }
        }
      }
    },
    '/lawyers/login': {
      post: {
        tags: ['2. Lawyer Controller'],
        summary: 'Advocate login via SBC number or email',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['password'],
                properties: {
                  sbcNumber: { type: 'string', example: 'SBC-4819' },
                  email: { type: 'string', example: 'fatima.shah@sindhbar.gov.pk' },
                  password: { type: 'string', example: 'AdvocatePass@123' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Login successful, returns JWT token' }
        }
      }
    },
    '/lawyers': {
      get: {
        tags: ['2. Lawyer Controller'],
        summary: 'Search SBC Advocates directory',
        parameters: [
          { name: 'specialty', in: 'query', schema: { type: 'string' } },
          { name: 'district', in: 'query', schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'List of advocates' }
        }
      }
    },
    '/lawyers/{id}': {
      get: {
        tags: ['2. Lawyer Controller'],
        summary: 'Get advocate profile by ID',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, example: 1 }
        ],
        responses: {
          200: { description: 'Advocate details' }
        }
      },
      put: {
        tags: ['2. Lawyer Controller'],
        summary: 'Update advocate profile details',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, example: 1 }
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  phone: { type: 'string' },
                  bio: { type: 'string' },
                  education: { type: 'string' },
                  experienceYears: { type: 'integer' },
                  officeAddress: { type: 'string' },
                  isAvailable: { type: 'boolean' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Profile updated' }
        }
      }
    },
    '/lawyers/{id}/cases': {
      get: {
        tags: ['2. Lawyer Controller'],
        summary: 'Get active cases assigned to lawyer',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          200: { description: 'Assigned cases' }
        }
      }
    },
    '/lawyers/{id}/requests': {
      get: {
        tags: ['2. Lawyer Controller'],
        summary: 'Get client consultation requests',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          200: { description: 'List of requests' }
        }
      },
      post: {
        tags: ['2. Lawyer Controller'],
        summary: 'Create a direct consultation request for lawyer',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['clientName', 'phone', 'requestedDate'],
                properties: {
                  clientName: { type: 'string', example: 'Kareem Buksh' },
                  phone: { type: 'string', example: '03129876543' },
                  requestedDate: { type: 'string', example: '2026-11-26' },
                  notes: { type: 'string', example: 'Urgent stay order consultation' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Request created' }
        }
      }
    },
    '/lawyers/{id}/requests/{requestId}/accept': {
      put: {
        tags: ['2. Lawyer Controller'],
        summary: 'Accept client consultation request',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
          { name: 'requestId', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          200: { description: 'Request accepted' }
        }
      }
    },
    '/lawyers/{id}/requests/{requestId}/decline': {
      put: {
        tags: ['2. Lawyer Controller'],
        summary: 'Decline client consultation request',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
          { name: 'requestId', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          200: { description: 'Request declined' }
        }
      }
    },
    '/lawyers/{id}/schedule': {
      get: {
        tags: ['2. Lawyer Controller'],
        summary: 'Get advocate office hours and consultation schedule',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          200: { description: 'Office hours and schedule' }
        }
      },
      put: {
        tags: ['2. Lawyer Controller'],
        summary: 'Update advocate office hours and availability',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  isAvailable: { type: 'boolean', example: true },
                  officeHours: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        day: { type: 'string', example: 'Monday' },
                        startTime: { type: 'string', example: '10:00' },
                        endTime: { type: 'string', example: '16:00' }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Schedule updated' }
        }
      }
    },
    '/lawyers/{id}/rate': {
      post: {
        tags: ['2. Lawyer Controller'],
        summary: 'Advocate rating policy endpoint (ratings retired per SBC standards)',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['rating'],
                properties: {
                  rating: { type: 'number', minimum: 1, maximum: 5, example: 5 }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Rating recorded' }
        }
      }
    },

    // =========================================================================
    // 3. ADMIN CONTROLLER
    // =========================================================================
    '/admin/login': {
      post: {
        tags: ['3. Admin Controller'],
        summary: 'Admin login for Sindh Bar Council governance',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'anjumkalwar.cs@gmail.com' },
                  password: { type: 'string', example: 'AnjumPassword2026@!' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Admin JWT token & profile returned' },
          401: { description: 'Invalid email or password' }
        }
      }
    },
    '/admin/me': {
      get: {
        tags: ['3. Admin Controller'],
        summary: 'Get authenticated admin profile',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Current admin details' }
        }
      }
    },
    '/admin/stats': {
      get: {
        tags: ['3. Admin Controller'],
        summary: 'Get platform-wide ecosystem statistics (Citizens, Lawyers, Cases, NGOs & Media)',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Ecosystem overview metrics and counts' }
        }
      }
    },
    '/admin/citizens': {
      get: {
        tags: ['3. Admin Controller'],
        summary: 'View and search registered citizens (Privacy-protected: no sensitive credentials)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'search', in: 'query', description: 'Search by full name, email, phone, CNIC', schema: { type: 'string' } },
          { name: 'status', in: 'query', description: 'Filter: all, active, suspended, restricted', schema: { type: 'string', default: 'all' } },
          { name: 'district', in: 'query', schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } }
        ],
        responses: {
          200: { description: 'Paginated list of citizens' }
        }
      }
    },
    '/admin/citizens/{id}': {
      get: {
        tags: ['3. Admin Controller'],
        summary: 'View single citizen profile details, case history, and evidence vault count',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, example: 1 }
        ],
        responses: {
          200: { description: 'Citizen profile details' }
        }
      },
      delete: {
        tags: ['3. Admin Controller'],
        summary: 'Remove or deactivate citizen account (with audit logging)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          200: { description: 'Citizen account removed' }
        }
      }
    },
    '/admin/citizens/{id}/status': {
      put: {
        tags: ['3. Admin Controller'],
        summary: 'Update citizen status (Suspend, Restrict, or Activate)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: {
                  status: { type: 'string', enum: ['active', 'suspended', 'restricted', 'inactive'], example: 'suspended' },
                  reason: { type: 'string', example: 'Violation of Terms of Service' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Citizen status updated & audit logged' }
        }
      }
    },
    '/admin/lawyers': {
      get: {
        tags: ['3. Admin Controller'],
        summary: 'View and search SBC Advocates roster (Active & Suspended)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string', default: 'all' } },
          { name: 'specialty', in: 'query', schema: { type: 'string' } },
          { name: 'district', in: 'query', schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } }
        ],
        responses: {
          200: { description: 'Paginated list of advocates' }
        }
      }
    },
    '/admin/lawyers/{id}': {
      get: {
        tags: ['3. Admin Controller'],
        summary: 'View single advocate profile, SBC credentials, and assigned cases',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          200: { description: 'Advocate profile details' }
        }
      },
      delete: {
        tags: ['3. Admin Controller'],
        summary: 'Remove advocate from Sindh Bar Council roster',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          200: { description: 'Advocate removed' }
        }
      }
    },
    '/admin/lawyers/{id}/status': {
      put: {
        tags: ['3. Admin Controller'],
        summary: 'Update advocate account status (Suspend or Activate in case of violation)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: {
                  status: { type: 'string', enum: ['active', 'suspended', 'restricted'], example: 'suspended' },
                  reason: { type: 'string', example: 'Disciplinary review under SBC Rule 42' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Lawyer status updated and audit logged' }
        }
      }
    },
    '/admin/ngos': {
      get: {
        tags: ['3. Admin Controller'],
        summary: 'View and search accredited NGOs & Legal Aid foundations',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string', default: 'all' } }
        ],
        responses: {
          200: { description: 'List of NGOs' }
        }
      }
    },
    '/admin/ngos/{id}': {
      get: {
        tags: ['3. Admin Controller'],
        summary: 'View single NGO profile and community stories',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          200: { description: 'NGO details' }
        }
      },
      delete: {
        tags: ['3. Admin Controller'],
        summary: 'Revoke NGO accreditation',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          200: { description: 'NGO removed' }
        }
      }
    },
    '/admin/ngos/{id}/status': {
      put: {
        tags: ['3. Admin Controller'],
        summary: 'Update NGO accreditation status (Active, Suspended)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: {
                  status: { type: 'string', enum: ['Active', 'Suspended', 'Inactive'], example: 'Suspended' },
                  reason: { type: 'string', example: 'Annual audit check' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'NGO status updated' }
        }
      }
    },
    '/admin/media': {
      get: {
        tags: ['3. Admin Controller'],
        summary: 'View and search accredited media channels and journalism desks',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string', default: 'all' } }
        ],
        responses: {
          200: { description: 'List of media outlets' }
        }
      }
    },
    '/admin/media/{id}': {
      get: {
        tags: ['3. Admin Controller'],
        summary: 'View media channel profile and published legal coverage stories',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          200: { description: 'Media profile details' }
        }
      },
      delete: {
        tags: ['3. Admin Controller'],
        summary: 'Revoke media accreditation',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          200: { description: 'Media outlet removed' }
        }
      }
    },
    '/admin/media/{id}/status': {
      put: {
        tags: ['3. Admin Controller'],
        summary: 'Update media accreditation status (Active, Suspended)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: {
                  status: { type: 'string', enum: ['Active', 'Suspended', 'Inactive'], example: 'Suspended' },
                  reason: { type: 'string', example: 'Broadcast standards review' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Media status updated' }
        }
      }
    },
    '/admin/audit-logs': {
      get: {
        tags: ['3. Admin Controller'],
        summary: 'Retrieve paginated system & security audit logs with timestamps',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
          { name: 'entity_type', in: 'query', schema: { type: 'string', default: 'all' } },
          { name: 'action', in: 'query', schema: { type: 'string' } },
          { name: 'search', in: 'query', schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Paginated list of system audit logs' }
        }
      },
      post: {
        tags: ['3. Admin Controller'],
        summary: 'Inject a manual system or compliance audit log entry',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['action', 'entityType', 'description'],
                properties: {
                  action: { type: 'string', example: 'ROSTER_AUDIT' },
                  entityType: { type: 'string', example: 'system' },
                  entityName: { type: 'string', example: 'Sindh Bar Council Roster Audit' },
                  description: { type: 'string', example: 'Quarterly compliance check completed.' },
                  severity: { type: 'string', enum: ['info', 'warning', 'critical'], example: 'info' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Audit log created' }
        }
      }
    },
    '/admin/notifications': {
      get: {
        tags: ['3. Admin Controller'],
        summary: 'Get admin notifications & real-time alerts with unread counter',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'unreadOnly', in: 'query', schema: { type: 'boolean', default: false } }
        ],
        responses: {
          200: { description: 'List of notifications and unread count' }
        }
      }
    },
    '/admin/notifications/{id}/read': {
      put: {
        tags: ['3. Admin Controller'],
        summary: 'Mark an administrative notification as read',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          200: { description: 'Notification marked as read' }
        }
      }
    },
    '/admin/notifications/mark-all-read': {
      put: {
        tags: ['3. Admin Controller'],
        summary: 'Mark all administrative notifications as read',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'All notifications marked as read' }
        }
      }
    },
    '/admin/flagged-cases': {
      get: {
        tags: ['3. Admin Controller'],
        summary: 'List flagged cases requiring administrative review',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'List of flagged cases' }
        }
      }
    },

    // =========================================================================
    // 4. NGO CONTROLLER
    // =========================================================================
    '/ngo/register': {
      post: {
        tags: ['4. NGO Controller'],
        summary: 'Register an NGO / Legal Aid foundation',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['fullName', 'email', 'phone', 'district', 'password'],
                properties: {
                  fullName: { type: 'string', example: 'Sindh Legal Aid Society' },
                  email: { type: 'string', example: 'info@slas.org.pk' },
                  phone: { type: 'string', example: '03211234567' },
                  district: { type: 'string', example: 'Karachi' },
                  organizationType: { type: 'string', example: 'Legal Aid / Human Rights' },
                  registrationNumber: { type: 'string', example: 'NGO-SLAS-2024' },
                  resourcePerson: { type: 'string', example: 'Justice (R) Nasir Aslam' },
                  password: { type: 'string', example: 'NgoPass@123' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'NGO registered' }
        }
      }
    },
    '/ngo/login': {
      post: {
        tags: ['4. NGO Controller'],
        summary: 'Login for NCHD (NGO) or institutional partner',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'contact@nchd.org.pk' },
                  password: { type: 'string', example: 'Nchd@12345' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Institutional session token' }
        }
      }
    },
    '/ngo': {
      get: {
        tags: ['4. NGO Controller'],
        summary: 'List all registered NGOs and legal aid organizations',
        responses: {
          200: { description: 'List of NGOs' }
        }
      }
    },
    '/ngo/me': {
      get: {
        tags: ['4. NGO Controller'],
        summary: 'Get authenticated NGO profile',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'NGO profile details' }
        }
      }
    },
    '/ngo/analytics/heatmap': {
      get: {
        tags: ['4. NGO Controller'],
        summary: 'Get Sindh judicial case density heatmap by district',
        responses: {
          200: { description: 'District-wise heatmap statistics' }
        }
      }
    },
    '/ngo/docket': {
      get: {
        tags: ['4. NGO Controller'],
        summary: 'Get anonymized public docket of active legal disputes',
        responses: {
          200: { description: 'Public docket entries' }
        }
      }
    },
    '/ngo/leads': {
      get: {
        tags: ['4. NGO Controller'],
        summary: 'Get citizen pro-bono aid requests (leads) requiring assistance',
        responses: {
          200: { description: 'List of citizen aid requests' }
        }
      }
    },
    '/ngo/cases/{caseId}/assist': {
      post: {
        tags: ['4. NGO Controller'],
        summary: 'Offer pro-bono assistance or legal aid for a citizen case',
        parameters: [
          { name: 'caseId', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string', example: 'NCHD Legal Aid cell is prepared to represent this case.' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Assistance offered' }
        }
      }
    },
    '/ngo/cases/{caseId}/status': {
      put: {
        tags: ['4. NGO Controller'],
        summary: 'Update NGO assistance status on a case',
        parameters: [
          { name: 'caseId', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: {
                  status: { type: 'string', example: 'Assistance Provided' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Status updated' }
        }
      }
    },
    '/ngo/stories': {
      get: {
        tags: ['4. NGO Controller'],
        summary: 'Get published NGO community impact stories',
        responses: {
          200: { description: 'List of NGO stories' }
        }
      },
      post: {
        tags: ['4. NGO Controller'],
        summary: 'Publish a new community impact or legal aid success story',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'content'],
                properties: {
                  title: { type: 'string', example: 'Free Legal Aid for 50 Families in Tharparkar' },
                  category: { type: 'string', example: 'Human Rights' },
                  content: { type: 'string', example: 'Comprehensive legal aid and documentation support provided.' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Story created' }
        }
      }
    },
    '/ngo/reports/export': {
      post: {
        tags: ['4. NGO Controller'],
        summary: 'Generate institutional PDF impact report',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  district: { type: 'string', example: 'All' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Report generated, returns download URL' }
        }
      }
    },

    // =========================================================================
    // 5. MEDIA CONTROLLER
    // =========================================================================
    '/media/register': {
      post: {
        tags: ['5. Media Controller'],
        summary: 'Register a news channel or investigative media outlet',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['fullName', 'email', 'phone', 'district', 'password'],
                properties: {
                  fullName: { type: 'string', example: 'KTN News Desk' },
                  channelName: { type: 'string', example: 'KTN News' },
                  email: { type: 'string', example: 'desk@ktnnews.tv' },
                  phone: { type: 'string', example: '03009988776' },
                  district: { type: 'string', example: 'Karachi' },
                  mediaType: { type: 'string', example: 'Broadcast Television' },
                  resourcePerson: { type: 'string', example: 'Bureau Chief' },
                  password: { type: 'string', example: 'MediaPass@123' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Media outlet registered' }
        }
      }
    },
    '/media/login': {
      post: {
        tags: ['5. Media Controller'],
        summary: 'Login for media channel / journalism desk',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'desk@ktnnews.tv' },
                  password: { type: 'string', example: 'MediaPass@123' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Media JWT session token' }
        }
      }
    },
    '/media': {
      get: {
        tags: ['5. Media Controller'],
        summary: 'List all accredited media partners',
        responses: {
          200: { description: 'List of media outlets' }
        }
      }
    },
    '/media/me': {
      get: {
        tags: ['5. Media Controller'],
        summary: 'Get authenticated media desk profile',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Media profile' }
        }
      }
    },
    '/media/analytics/heatmap': {
      get: {
        tags: ['5. Media Controller'],
        summary: 'Get judicial case density heatmap for investigative reporting',
        responses: {
          200: { description: 'Heatmap statistics' }
        }
      }
    },
    '/media/docket': {
      get: {
        tags: ['5. Media Controller'],
        summary: 'Get public court docket of active public-interest cases',
        responses: {
          200: { description: 'Public docket entries' }
        }
      }
    },
    '/media/leads': {
      get: {
        tags: ['5. Media Controller'],
        summary: 'Get public-interest citizen cases requesting media coverage',
        responses: {
          200: { description: 'Citizen media leads' }
        }
      }
    },
    '/media/cases/{caseId}/status': {
      put: {
        tags: ['5. Media Controller'],
        summary: 'Update media coverage status on a case',
        parameters: [
          { name: 'caseId', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: {
                  status: { type: 'string', example: 'Coverage In-Progress' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Status updated' }
        }
      }
    },
    '/media/stories': {
      get: {
        tags: ['5. Media Controller'],
        summary: 'Get published investigative journalism stories',
        responses: {
          200: { description: 'List of published stories' }
        }
      },
      post: {
        tags: ['5. Media Controller'],
        summary: 'Publish a new investigative journalism piece',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'content'],
                properties: {
                  title: { type: 'string', example: 'Special Report: Delayed Inheritance Disputes in Sindh' },
                  category: { type: 'string', example: 'Civil Justice' },
                  content: { type: 'string', example: 'An in-depth investigation into property case backlogs.' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Story published' }
        }
      }
    },
    '/media/reports/export': {
      post: {
        tags: ['5. Media Controller'],
        summary: 'Generate downloadable press bulletin PDF',
        responses: {
          200: { description: 'Press report generated' }
        }
      }
    },

    // =========================================================================
    // 6. CASE CONTROLLER
    // =========================================================================
    '/cases': {
      post: {
        tags: ['6. Case Controller'],
        summary: 'Create and file a new legal case (Protected citizen)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'category', 'description'],
                properties: {
                  title: { type: 'string', example: 'Illegal Dispossession Complaint' },
                  category: { type: 'string', example: 'Property' },
                  court: { type: 'string', example: 'Sindh High Court' },
                  district: { type: 'string', example: 'Karachi South' },
                  description: { type: 'string', example: 'Encroachment under Illegal Dispossession Act 2005' },
                  hearingDate: { type: 'string', example: '2026-12-20' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Case created successfully' }
        }
      }
    },
    '/cases/my': {
      get: {
        tags: ['6. Case Controller'],
        summary: 'Get cases filed by or assigned to the authenticated user',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'List of user cases' }
        }
      }
    },
    '/cases/{id}': {
      get: {
        tags: ['6. Case Controller'],
        summary: 'Get detailed information for a specific case',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, example: 1 }
        ],
        responses: {
          200: { description: 'Case details returned' }
        }
      }
    },
    '/cases/{id}/status': {
      put: {
        tags: ['6. Case Controller'],
        summary: 'Update legal status of a case (pending, active, disposed, etc.)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: {
                  status: { type: 'string', example: 'active' },
                  hearingDate: { type: 'string', example: '2026-12-28' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Case status updated' }
        }
      }
    },
    '/cases/{id}/assign': {
      put: {
        tags: ['6. Case Controller'],
        summary: 'Assign an advocate to a case (Lawyer or Admin)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['lawyerId'],
                properties: {
                  lawyerId: { type: 'integer', example: 1 }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Advocate assigned to case' }
        }
      }
    }
  }
};

module.exports = swaggerSpec;
