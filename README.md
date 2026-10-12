\# HostelOps — Smart Hostel Complaint \& Maintenance Management Platform



A full-stack web application that streamlines hostel maintenance by connecting students, wardens, technicians, and administrators through a centralized complaint-management workflow.



HostelOps helps students report maintenance problems, enables staff to manage complaint lifecycles, and provides role-based access to complaint information and supporting photo/video evidence.



\## Key Features



\- \*\*Complaint Management:\*\* Create complaints with descriptions, categories, priorities, rooms, and supporting attachments.

\- \*\*Role-Based Access Control:\*\* Separate workflows and permissions for students, wardens, technicians, and administrators.

\- \*\*Intelligent Technician Assignment:\*\* Support maintenance allocation based on relevant skills, urgency, availability, workload, and hostel/location considerations, where implemented.

\- \*\*Complaint Lifecycle Tracking:\*\* Manage complaint progress through submission, acknowledgement, assignment, work in progress, resolution, and closure.

\- \*\*Photo \& Video Attachments:\*\* Upload supporting evidence to Cloudinary and store attachment metadata in PostgreSQL.

\- \*\*Private Attachment Access:\*\* Retrieve protected attachments through authenticated API endpoints and signed URLs.

\- \*\*Database Migrations:\*\* Manage database schema changes using Alembic.

\- \*\*REST API Documentation:\*\* Explore and test backend endpoints through FastAPI's interactive API documentation.

\- \*\*Responsive User Interface:\*\* Use the web application to create complaints and view complaint information and status.



\## Technology Stack



| Layer | Technologies |

|---|---|

| Frontend | React, Vite, Tailwind CSS |

| Backend | Python, FastAPI, Pydantic |

| Database | PostgreSQL, Neon |

| ORM | SQLAlchemy 2.x |

| Database Migrations | Alembic |

| Authentication | JWT-based authentication and role-based authorization |

| File Storage | Cloudinary |

| Deployment | Render |



\## System Architecture





\## System Architecture



```mermaid

flowchart TD

&#x20;   U\["Students, Wardens, Technicians, Admin"]

&#x20;   F\["React + Vite + Tailwind CSS"]

&#x20;   A\["FastAPI REST API"]

&#x20;   AU\["JWT Authentication and Role-Based Authorization"]

&#x20;   S\["Complaint Management and Assignment"]

&#x20;   D\[("Neon PostgreSQL")]

&#x20;   C\["Cloudinary Private Photo/Video Storage"]

&#x20;   M\["Alembic Database Migrations"]

&#x20;   R\["Render Deployment"]



&#x20;   U --> F

&#x20;   F --> A

&#x20;   A --> AU

&#x20;   AU --> S

&#x20;   S --> D

&#x20;   S --> C

&#x20;   M --> D

&#x20;   F -. hosted on .-> R

&#x20;   A -. hosted on .-> R

```





\## Complaint Workflow



\## Complaint Workflow



```text

SUBMITTED

&#x20;   |

&#x20;   v

ACKNOWLEDGED

&#x20;   |

&#x20;   v

ASSIGNED

&#x20;   |

&#x20;   v

IN\_PROGRESS

&#x20;   |

&#x20;   v

RESOLVED

&#x20;   |

&#x20;   v

CLOSED

```



The workflow provides visibility into maintenance progress and helps staff coordinate complaint resolution.

The workflow provides visibility into maintenance progress and helps staff coordinate complaint resolution.



\## Security and Reliability



\- Role-based authorization for protected complaint operations.

\- Complaint ownership and access checks.

\- Environment-based configuration for database and storage credentials.

\- Protected file retrieval using signed URLs.

\- Request validation and appropriate API error responses.

\- Version-controlled database migrations.



\## Local Development



\### Prerequisites



\- Python

\- Node.js and npm

\- PostgreSQL-compatible database

\- Cloudinary account for attachment storage



\### 1. Clone the repository



```bash

git clone https://github.com/nandinimogilicharla2104/hostelops.git

cd hostelops

```



\### 2. Set up the backend



Create and activate a Python virtual environment.



\*\*Windows PowerShell:\*\*



```powershell

python -m venv venv

.\\venv\\Scripts\\Activate.ps1

pip install -r requirements.txt

```



Create a local `.env` file containing the configuration variables required by your application. Use the actual variable names expected by the existing project. Never commit credentials or production secrets.



\### 3. Apply database migrations



```powershell

python -m alembic upgrade head

```



\### 4. Start the backend



```powershell

python -m uvicorn app.main:app --reload

```



Open the interactive API documentation at:



`http://127.0.0.1:8000/docs`



\### 5. Start the frontend



In another terminal:



```powershell

npm --prefix frontend install

npm --prefix frontend run dev

```



Open the local frontend URL printed by Vite.



\## Production Deployment



The application uses Render for hosting, Neon for PostgreSQL, and Cloudinary for attachment storage.



Production configuration must be supplied through environment variables. Configure the frontend's API base URL and the backend's CORS origins for the deployed environments.



\## Application Screenshots



\### 1. Dashboard

View complaint summaries, status indicators, and the main navigation.



!\[HostelOps Dashboard](docs/screenshots/dashboard.png)



\### 2. Complaint Details

View complaint information, workflow status, and attached photos or videos.



!\[HostelOps Complaint Details](docs/screenshots/complaint-details.png)



\### 3. Create Complaint

Submit a hostel maintenance complaint with the relevant details and attachments.



!\[HostelOps Create Complaint](docs/screenshots/create-complaint.png)



\## Future Enhancements



\- Real-time complaint status notifications.

\- Maintenance analytics and SLA monitoring.

\- QR-based hostel outpass and return verification.

\- Audit logs and more comprehensive automated tests.

\- Advanced workload-aware technician assignment.



\## Project Goals



HostelOps demonstrates practical full-stack development, REST API design, relational database management, authentication and authorization, cloud file storage, schema migrations, and production deployment.

## Live Demo

**[Open HostelOps Web Application](https://hostelops-frontend.onrender.com/)**

**[View Source Code on GitHub](https://github.com/nandinimogilicharla2104/hostelops)**

**[Explore Backend API Documentation](https://hostelops-api.onrender.com/docs)**

\## Author



\*\*Nandini Mogilicharla\*\*



Computer Science (Data Science) Undergraduate | Aspiring Backend \& Full-Stack Developer



GitHub: https://github.com/nandinimogilicharla2104

