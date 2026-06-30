# Hospital Management System Prototype

## Course / Group Information

**Course Name and Code:** Add course name and code here  
**Group:** Group #3  
**Group Members:**

| Name | Registration Number |
|---|---|
| Francis Charles Mbayo | 22396/2023 |
| Thomas Yorwartie | 22067/2023 |
| Edward Cole | 25260/2024 |

## Selected Application / System

**Hospital Management System**

## Figma Project Link

[Open Figma Prototype](https://hospitalmanagement.figma.site)

> Ensure the Figma/project link permissions are set to **Anyone with the link can view** before submission.

## Project Overview

This project is a responsive **Hospital Management System prototype** created for a UI/UX assignment. It demonstrates how a hospital can digitize patient access, hospital service booking, appointment confirmation, and medical record viewing using a clean blue, green, and white healthcare interface.

The current prototype focuses on one live patient profile:

- **Patient:** Francis Charles Mbayo
- **Age:** 20
- **Email:** mbayocharles26@gmail.com
- **Patient ID:** RW-2026-420

The prototype does **not** include stored doctor records. Instead, it uses a hospital services flow where the patient selects a service, books a time, receives confirmation, and views records.

## Problem Statement

Many hospitals still rely on manual patient files, physical appointment books, and in-person queue management. This can cause long waiting times, lost or duplicated records, unclear service access, and repeated paperwork for patients.

The target users are **patients, hospital staff, and administrators**. Patients need a faster way to book hospital services and access records. Hospital staff need organized patient information and clearer appointment details. Administrators need a structured overview of services, appointments, and patient records.

This system matters because it improves healthcare efficiency, accessibility, communication, and record accuracy. A digital flow reduces waiting time, keeps patient information organized, and supports a more user-friendly hospital experience.

## User Persona

| Field | Details |
|---|---|
| Name | Francis Charles Mbayo |
| Age | 20 |
| Patient ID | RW-2026-420 |
| Goals | Book hospital services quickly, view medical records, receive appointment confirmation, and manage profile access |
| Frustrations | Long queues, slow record access, unclear service availability, and repeated paperwork |
| Needs | Mobile-friendly booking flow, clear confirmations, secure records, and accessible navigation |


### Doctor Persona

| Field | Details |
|---|---|
| Name | Dr. Dabanica Payne |
| Specialty | General Medicine |
| Doctor ID | DOC-2026-0201 |
| License No. | KGL-MED-2026-0201 |
| Hospital | Hospital Kigali |
| Experience | 6 years |
| Goals | Manage appointments, view assigned patient information, update availability, and support patient care |
| Frustrations | Disorganized schedules, delayed patient information, manual appointment tracking, and poor coordination |
| Needs | Clear appointment dashboard, secure access to patient records, simple scheduling tools, and reliable notifications |

### Admin Persona

| Field | Details |
|---|---|
| Name | Francis Charles Mbayo |
| Role | System Administrator |
| Admin ID | ADM-2026-001 |
| Organization | Hospital Kigali |
| Goals | Manage hospital services, monitor appointments, organize patient records, and keep the system updated |
| Frustrations | Scattered records, manual reporting, unclear appointment status, and difficulty tracking hospital activity |
| Needs | Centralized dashboard, organized patient data, appointment monitoring tools, secure access, and clear system controls |

## User Flow Explanation

```text
Login/Register → Dashboard → Services → Appointment Booking → Confirmation → Profile/Records
```

### Flow Description

1. The patient logs in or creates an account.
2. The dashboard gives an overview of available actions.
3. The patient selects a hospital service.
4. The patient chooses an appointment time.
5. The appointment confirmation screen confirms the booking.
6. The patient can view profile information and medical records.

Additional screens included in the React prototype:

```text
Dashboard → Alerts
Dashboard → Settings
```

## Brief Design Explanation

The design uses a professional hospital theme with:

- **Blue** for trust, professionalism, and primary actions.
- **Green** for health, success states, and appointment confirmation.
- **White/light surfaces** for readability and clean medical presentation.

The interface is mobile-friendly, with responsive layouts, clear buttons, readable text, and bottom navigation on small screens.

## Features Implemented

- Patient login screen
- Patient registration screen
- Dashboard overview
- Hospital services screen
- Appointment booking with time selection
- Appointment confirmation
- Patient profile and records
- Alerts screen
- Settings screen
- Mobile bottom navigation
- Responsive layout for mobile and desktop

## Accessibility Considerations

The prototype includes:

- Readable text sizes for mobile and desktop.
- High-contrast text and buttons.
- Clear navigation labels and consistent icon use.
- Touch-friendly buttons and bottom navigation.
- Consistent spacing and simple screen structure.
- Confirmation feedback for appointment booking.

## Challenges Faced

- Keeping the prototype simple while still covering the required user flow.
- Making the layout work well on mobile screens.
- Keeping patient data consistent across all screens.
- Organizing exported design files and documentation for GitHub submission.

## Repository Structure

```text
/
├── assets/
├── docs/
│   └── report.md
├── high-fidelity-designs/
│   ├── appointment-booking.svg
│   ├── appointment-confirmation.svg
│   ├── booking-screen.png
│   ├── dashboard-screen.png
│   ├── dashboard.svg
│   ├── login-screen.png
│   ├── login.svg
│   ├── patient-profile.svg
│   └── service-list.svg
├── prototype/
│   ├── figma-prototype-link.md
│   ├── prototype-link.md
│   ├── user-flow-diagram.png
│   └── user-flow-diagram.svg
├── src/
│   ├── app/
│   │   └── App.tsx
│   └── styles/
│       ├── fonts.css
│       └── theme.css
├── wireframes/
│   ├── dashboard-wireframe.png
│   ├── dashboard-wireframe.svg
│   ├── login-register-wireframe.svg
│   ├── login-wireframe.png
│   ├── patient-profile-records-wireframe.svg
│   └── service-list-booking-wireframe.svg
└── README.md
```

## Instructions for Accessing Project Files

1. Open the Figma link above to view the prototype.
2. Review low-fidelity wireframes in `/wireframes`.
3. Review high-fidelity screens in `/high-fidelity-designs`.
4. Review prototype support files in `/prototype`.
5. Read the full project report in `/docs/report.md`.
6. Open `src/app/App.tsx` to review the React prototype implementation.

## How to Run the React Prototype

If running locally in the development environment:

```bash
pnpm install
pnpm run build
```

Or preview through the available Figma Make / React environment.

## Conclusion

The Hospital Management System prototype demonstrates a focused digital healthcare workflow for Francis Charles Mbayo. It supports login, registration, service selection, appointment booking, confirmation, and record viewing. The project is organized for GitHub submission with Markdown documentation, exported design files, prototype support files, and a professional README.
