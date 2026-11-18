/**
 * Barq-e-Insaf OpenAPI 3.0 / Swagger Specification
 * Comprehensive interactive API documentation & testing configuration
 */

const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Barq-e-Insaf API Testing Platform',
    version: '1.0.0',
    description: `
**Barq-e-Insaf Legal Tech Platform** REST API Server powered by Neon PostgreSQL.
Provides endpoints for Citizens, SBC-Verified Advocates, Sindh Bar Council Admin, NCHD (NGO), and KTN News (Media).
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
    { name: '1. Citizen Controller', description: 'Citizen registration, authentication, cases, legal vault, and consultations' },
    { name: '2. Lawyer Controller', description: 'SBC Advocate portal, licensing, intake cases, schedule, and client ratings' },
    { name: '3. Admin Controller', description: 'Sindh Bar Council administrative governance, lawyer verification, and stats' },
    { name: '4. NGO Controller', description: 'NCHD Legal Aid, pro-bono assistance, community stories, and case heatmaps' },
    { name: '5. Case Controller', description: 'Core legal case docket, dispatch, assignment, and status lifecycle' },
    { name: '6. Auth Controller', description: 'Unified authentication endpoints' }
  ],
  paths: {
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
        summary: 'Get current authenticated citizen profile',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Authenticated citizen data' },
          401: { description: 'Unauthorized' }
        }
      }
    },
    '/citizens/{id}/cases': {
      get: {
        tags: ['1. Citizen Controller'],
        summary: 'Get all cases for a specific citizen',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'List of citizen cases' }
        }
      },
      post: {
        tags: ['1. Citizen Controller'],
        summary: 'Create and file a new legal case intake',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'category', 'description'],
                properties: {
                  title: { type: 'string', example: 'Property Title Dispute in Clifton' },
                  category: { type: 'string', example: 'Property' },
                  description: { type: 'string', example: 'Disputed plot ownership against illegal encroachment.' },
                  district: { type: 'string', example: 'Karachi South' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Case intake created' }
        }
      }
    },
    '/lawyers/register': {
      post: {
        tags: ['2. Lawyer Controller'],
        summary: 'Register a new SBC advocate',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'phone', 'cnic', 'district', 'sbcNumber', 'password'],
                properties: {
                  name: { type: 'string', example: 'Adv. Fatima Shah' },
                  email: { type: 'string', example: 'fatima@barqeinsaf.pk' },
                  phone: { type: 'string', example: '03009876543' },
                  cnic: { type: 'string', example: '42201-7654321-2' },
                  district: { type: 'string', example: 'Hyderabad' },
                  sbcNumber: { type: 'string', example: 'SBC-4819' },
                  specialty: { type: 'string', example: 'Family & Property Law' },
                  password: { type: 'string', example: 'LawyerPass@123' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Lawyer registered pending SBC verification' }
        }
      }
    },
    '/lawyers/login': {
      post: {
        tags: ['2. Lawyer Controller'],
        summary: 'Login advocate',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['password'],
                properties: {
                  email: { type: 'string', example: 'fatima@barqeinsaf.pk' },
                  password: { type: 'string', example: 'LawyerPass@123' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Login successful' }
        }
      }
    },
    '/lawyers': {
      get: {
        tags: ['2. Lawyer Controller'],
        summary: 'Public directory of SBC verified advocates',
        parameters: [
          { name: 'district', in: 'query', schema: { type: 'string' } },
          { name: 'specialty', in: 'query', schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'List of lawyers' }
        }
      }
    },
    '/lawyers/{id}': {
      get: {
        tags: ['2. Lawyer Controller'],
        summary: 'Get advocate profile by ID',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Lawyer profile details' }
        }
      }
    },
    '/lawyers/{id}/cases': {
      get: {
        tags: ['2. Lawyer Controller'],
        summary: 'Get active cases assigned to lawyer',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Assigned cases' }
        }
      }
    },
    '/lawyers/{id}/requests': {
      get: {
        tags: ['2. Lawyer Controller'],
        summary: 'Get pending client consultation requests',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'List of requests' }
        }
      }
    },
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
                  email: { type: 'string', example: 'admin@barqeinsaf.pk' },
                  password: { type: 'string', example: 'AdminPass@123' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Admin JWT token' }
        }
      }
    },
    '/admin/stats': {
      get: {
        tags: ['3. Admin Controller'],
        summary: 'Get platform-wide statistics',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Ecosystem overview metrics' }
        }
      }
    },
    '/admin/pending-lawyers': {
      get: {
        tags: ['3. Admin Controller'],
        summary: 'List lawyers awaiting SBC verification',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Pending lawyer accounts' }
        }
      }
    },
    '/admin/lawyers/{id}/verify': {
      put: {
        tags: ['3. Admin Controller'],
        summary: 'Verify or decline an advocate SBC license',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  verified: { type: 'boolean', example: true }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Lawyer status updated' }
        }
      }
    },
    '/ngo/login': {
      post: {
        tags: ['4. NGO Controller'],
        summary: 'Login for NCHD (NGO) or KTN News (Media)',
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
    '/ngo/analytics/heatmap': {
      get: {
        tags: ['4. NGO Controller'],
        summary: 'Get Sindh judicial case density heatmap',
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
    '/cases': {
      post: {
        tags: ['5. Case Controller'],
        summary: 'Create a new legal case (Protected citizen)',
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
                  description: { type: 'string', example: 'Encroachment under Illegal Dispossession Act 2005' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Case created' }
        }
      }
    },
    '/cases/my': {
      get: {
        tags: ['5. Case Controller'],
        summary: 'Get cases for current authenticated user',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'List of user cases' }
        }
      }
    }
  }
};

module.exports = swaggerSpec;
