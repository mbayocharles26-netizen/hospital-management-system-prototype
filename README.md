# Hospital Management System Prototype

**Cours Name :** Group #3
**Group Members:** 22396/2023  
**Figma Link:** https://www.figma.com/make/bYbRYaAJlkYP4qmR9i2HGM/Hospital-management-system?fullscreen=1&t=eMSovWDaSGtUA7Z8-1&code-node-id=0-9

## 1. Final Project Choice

Our group selected the **Hospital Management System** as the final prototype idea. The project focuses on improving patient appointment booking, doctor scheduling, and access to medical records through a simple digital platform.

## 2. Problem Statement

Many hospitals still depend on manual patient records, paper-based appointment books, and in-person queue management. This often causes long waiting times, misplaced information, scheduling conflicts, and poor communication between patients, doctors, and hospital staff.

The target users for this system are patients, doctors, hospital staff, and administrators. Patients need a faster way to book appointments and access records. Doctors need organized schedules. Hospital staff and administrators need tools for coordinating services and reducing operational delays.

This system matters because it improves efficiency, accessibility, and patient experience. By digitizing appointment booking and patient record access, hospitals can reduce waiting time, improve staff coordination, and make healthcare services easier to manage.

## 3. User Persona

| Field        | Details                                                                             |
| ------------ | ----------------------------------------------------------------------------------- |
| Name         | Jeanette Uwimana                                                                    |
| Age          | 32                                                                                  |
| Occupation   | Teacher                                                                             |
| Goals        | Book appointments quickly, find available doctors, access medical records easily    |
| Frustrations | Long queues, difficulty knowing doctor availability, repeated paperwork             |
| Needs        | Simple mobile-friendly booking flow, clear confirmation, secure profile and records |

## 4. User Flow

```text
Login/Register → Dashboard → Select Doctor → Book Appointment → Confirmation → Profile/Records
```

### Flow Explanation

1. The user logs in or registers.
2. The user arrives at the dashboard and views available services.
3. The user selects a doctor from the doctor list.
4. The user chooses an appointment date and time.
5. The system confirms the appointment.
6. The user can view profile details and medical records.

## 5. Wireframes

Low-fidelity wireframes should be placed in `/wireframes`.

Required wireframe screens:

- Login/Register
- Dashboard
- Doctor List / Appointment Booking
- Patient Profile / Records

## 6. High-Fidelity UI Design

High-fidelity designs should be placed in `/high-fidelity-designs`.

Required polished screens:

- Login
- Dashboard
- Doctor List
- Appointment Booking
- Appointment Confirmation
- Patient Profile

The visual style uses hospital theme colors: blue, green, and white. The UI should include consistent typography, icons, spacing, navigation, and button styles.

## 7. Interactive Prototype

Prototype files, exports, or links should be placed in `/prototype`.

Prototype navigation:

```text
Login button → Dashboard
Book appointment → Doctor List
Doctor card → Appointment Booking
Confirm appointment → Confirmation
View records → Patient Profile
```

Recommended transitions:

- Fade between main screens
- Slide transition for forward navigation
- Clear button hover/pressed states

## 8. Accessibility

Accessibility requirements:

- Use readable font sizes of at least 16px.
- Maintain high contrast between text and background.
- Use clear navigation menus and labels.
- Keep button styles consistent across screens.
- Ensure mobile-friendly layouts with enough spacing for touch targets.

## 9. Repository Structure

```text
/
├── assets/
├── docs/
├── high-fidelity-designs/
├── prototype/
├── src/
│   ├── app/
│   │   └── App.tsx
│   └── styles/
│       ├── fonts.css
│       └── theme.css
├── wireframes/
└── README.md
```
