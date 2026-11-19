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
Provides endpoints for Citizens, SBC-Verified Advocates, Sindh Bar Council Admin Governance, NCHD (NGO), and KTN News (Media).
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
    { name: '3. Admin Controller', description: 'Sindh Bar Council administrative governance, ecosystem monitoring, accounts & audit logs' },
    { name: '4. NGO Controller', description: 'NCHD Legal Aid, pro-bono assistance, community stories, and case heatmaps' },
    { name: '5. Case Controller', description: 'Core legal case docket, dispatch, assignment, and status lifecycle' },
    { name: '6. Auth Controller', description: 'Unified authentication endpoints' }
  ],
  paths: {
    // ------------------- CITIZENS -------------------
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

    // ------------------- LAWYERS -------------------
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
                  name: { type: 'string', example: 'Barrister Tariq Hassan' },
                  email: { type: 'string', example: 'tariq.advocate@sindhbar.gov.pk' },
                  phone: { type: 'string', example: '03331234567' },
                  sbcNumber: { type: 'string', example: 'SBC-2024-9988' },
                  specialty: { type: 'string', example: 'Constitutional & Human Rights' },
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
                  sbcNumber: { type: 'string', example: 'SBC-2024-9988' },
                  email: { type: 'string', example: 'tariq.advocate@sindhbar.gov.pk' },
                  password: { type: 'string', example: 'AdvocatePass@123' }
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

    // ------------------- ADMIN CONTROLLER -------------------
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

    // Admin: Citizen Management
    '/admin/citizens': {
      get: {
        tags: ['3. Admin Controller'],
        summary: 'View and search registered citizens (Privacy-protected: no sensitive credentials)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'search', in: 'query', description: 'Search by full name, email, phone, CNIC', schema: { type: 'string' } },
          { name: 'status', in: 'query', description: 'Filter by status: all, active, suspended, restricted', schema: { type: 'string', default: 'all' } },
          { name: 'district', in: 'query', description: 'Filter by district', schema: { type: 'string' } },
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
          200: { description: 'Citizen profile details' },
          404: { description: 'Citizen not found' }
        }
      },
      delete: {
        tags: ['3. Admin Controller'],
        summary: 'Remove or deactivate a citizen account (with audit logging)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, example: 1 }
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  reason: { type: 'string', example: 'Account deactivated per administrative review' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Citizen account removed successfully' }
        }
      }
    },
    '/admin/citizens/{id}/status': {
      put: {
        tags: ['3. Admin Controller'],
        summary: 'Update citizen account status (Suspend, Restrict, or Activate)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, example: 1 }
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

    // Admin: Lawyer Management
    '/admin/lawyers': {
      get: {
        tags: ['3. Admin Controller'],
        summary: 'View and search SBC Advocates roster (Active & Suspended)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'search', in: 'query', description: 'Search by advocate name, email, SBC number, phone', schema: { type: 'string' } },
          { name: 'status', in: 'query', description: 'Filter: all, active, suspended', schema: { type: 'string', default: 'all' } },
          { name: 'specialty', in: 'query', description: 'Filter by legal specialty', schema: { type: 'string' } },
          { name: 'district', in: 'query', description: 'Filter by district', schema: { type: 'string' } },
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
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, example: 1 }
        ],
        responses: {
          200: { description: 'Advocate profile details' },
          404: { description: 'Lawyer not found' }
        }
      },
      delete: {
        tags: ['3. Admin Controller'],
        summary: 'Remove advocate from Sindh Bar Council roster (with audit logging)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, example: 1 }
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  reason: { type: 'string', example: 'SBC Bar License suspended' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Lawyer removed successfully' }
        }
      }
    },
    '/admin/lawyers/{id}/status': {
      put: {
        tags: ['3. Admin Controller'],
        summary: 'Update advocate account status (Suspend or Activate in case of violation)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, example: 1 }
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

    // Admin: NGO Management
    '/admin/ngos': {
      get: {
        tags: ['3. Admin Controller'],
        summary: 'View and search accredited NGOs & Legal Aid foundations',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'search', in: 'query', description: 'Search NGO by name, registration number, or email', schema: { type: 'string' } },
          { name: 'status', in: 'query', description: 'Filter: all, Active, Suspended', schema: { type: 'string', default: 'all' } },
          { name: 'district', in: 'query', schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } }
        ],
        responses: {
          200: { description: 'Paginated list of NGOs' }
        }
      }
    },
    '/admin/ngos/{id}': {
      get: {
        tags: ['3. Admin Controller'],
        summary: 'View single NGO profile and community stories',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, example: 1 }
        ],
        responses: {
          200: { description: 'NGO profile details' }
        }
      },
      delete: {
        tags: ['3. Admin Controller'],
        summary: 'Revoke NGO accreditation (with audit logging)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, example: 1 }
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
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, example: 1 }
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
                  reason: { type: 'string', example: 'Annual accreditation renewal required' }
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

    // Admin: Media Management
    '/admin/media': {
      get: {
        tags: ['3. Admin Controller'],
        summary: 'View and search accredited media channels and journalism desks',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'search', in: 'query', description: 'Search media outlet by name, channel, or email', schema: { type: 'string' } },
          { name: 'status', in: 'query', description: 'Filter: all, Active, Suspended', schema: { type: 'string', default: 'all' } },
          { name: 'district', in: 'query', schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } }
        ],
        responses: {
          200: { description: 'Paginated list of media outlets' }
        }
      }
    },
    '/admin/media/{id}': {
      get: {
        tags: ['3. Admin Controller'],
        summary: 'View media channel profile and published legal coverage stories',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, example: 1 }
        ],
        responses: {
          200: { description: 'Media profile details' }
        }
      },
      delete: {
        tags: ['3. Admin Controller'],
        summary: 'Revoke media accreditation (with audit logging)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, example: 1 }
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
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, example: 1 }
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
                  reason: { type: 'string', example: 'Broadcasting guidelines review' }
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

    // Admin: System & Security Audit Logs
    '/admin/audit-logs': {
      get: {
        tags: ['3. Admin Controller'],
        summary: 'Retrieve paginated system & security audit logs with timestamps',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
          { name: 'entity_type', in: 'query', description: 'Filter by entity: all, citizen, lawyer, ngo, media, case, system, auth', schema: { type: 'string', default: 'all' } },
          { name: 'action', in: 'query', description: 'Filter by action name', schema: { type: 'string' } },
          { name: 'search', in: 'query', description: 'Search inside log description or entity name', schema: { type: 'string' } }
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

    // Admin: Notifications & System Alerts
    '/admin/notifications': {
      get: {
        tags: ['3. Admin Controller'],
        summary: 'Get admin notifications & real-time alerts with unread counter',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'unreadOnly', in: 'query', description: 'Filter unread notifications only', schema: { type: 'boolean', default: false } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } }
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
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, example: 1 }
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

    // Admin: Flagged Cases & Legacy
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
    '/admin/pending-lawyers': {
      get: {
        tags: ['3. Admin Controller'],
        summary: 'Legacy: List lawyers awaiting SBC verification',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Pending lawyer accounts' }
        }
      }
    },
    '/admin/lawyers/{id}/verify': {
      put: {
        tags: ['3. Admin Controller'],
        summary: 'Legacy: Verify or decline advocate status',
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
                  status: { type: 'string', example: 'approved' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Lawyer verification status updated' }
        }
      }
    },

    // ------------------- NGO CONTROLLER -------------------
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

    // ------------------- CASES CONTROLLER -------------------
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
