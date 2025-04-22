# Plan de Desarrollo de la Aplicación de Gestión de Candidatos

Este documento detalla el plan para desarrollar una aplicación full-stack para gestionar datos de candidatos, con un frontend en Angular y un backend en NestJS.

## Objetivo

Crear una aplicación donde los usuarios puedan enviar información de candidatos a través de un formulario en el frontend, procesar detalles adicionales de un archivo cargado en el backend y mostrar todos los candidatos enviados en una tabla.

## Tecnología Stack

*   **Frontend:** Angular 16+
*   **UI Components:** Angular Material
*   **Backend:** NestJS
*   **Testing:** Jest (preferido)

## 1. Frontend (Angular 16+ con Angular Material)

*   **Configuración del Proyecto:**
    *   Crear un nuevo proyecto Angular utilizando Angular CLI.
    *   Añadir Angular Material al proyecto para los componentes de UI.
    *   Configurar Jest para las pruebas unitarias.
*   **Estructura de Componentes:**
    *   `AppComponent`: Componente principal.
    *   `CandidateFormComponent`: Componente para el formulario de entrada de datos.
    *   `CandidateListComponent`: Componente para mostrar la tabla de candidatos.
    *   Uso de componentes *standalone*.
*   **Implementación del Formulario (`CandidateFormComponent`):**
    *   `FormGroup` con campos `name`, `surname`, `candidateFile`.
    *   Validaciones requeridas.
    *   Input de tipo `file` para Excel (`.xlsx`, `.xls`).
    *   Manejo de selección de archivo.
    *   Lógica para enviar datos y archivo al backend.
*   **Servicios:**
    *   `CandidateService`: Comunicación HTTP con el backend.
    *   `CandidateDataService`: Almacenamiento incremental de datos de candidatos (usando `BehaviorSubject`).
*   **Visualización de Datos (`CandidateListComponent`):**
    *   Uso de `MatTable`.
    *   Columnas: `Name`, `Surname`, `Seniority`, `Years of Experience`, `Availability`.
    *   Suscripción a `CandidateDataService` para actualizaciones.
*   **Estilo y Diseño:**
    *   Aplicar tema de Angular Material alineado con el estilo de Banco Santander.
    *   Diseño moderno y minimalista.
*   **Pruebas:**
    *   Pruebas unitarias con Jest para componentes y servicios.

## 2. Backend (NestJS)

*   **Configuración del Proyecto:**
    *   Crear un nuevo proyecto NestJS utilizando NestJS CLI.
    *   Configurar Jest para las pruebas unitarias.
*   **Estructura de Módulos:**
    *   `AppModule`: Módulo raíz.
    *   `CandidatesModule`: Módulo para lógica de candidatos.
*   **Controlador (`CandidatesController`):**
    *   Endpoint POST `/candidates`.
    *   Uso de `@UploadedFile`, `@Body`.
*   **Servicio (`CandidatesService`):**
    *   Lógica para procesar archivo Excel (usando `xlsx`).
    *   Extracción de `Seniority`, `Years of experience`, `Availability`.
    *   Validación de datos extraídos.
    *   Combinación de datos del formulario y Excel en un objeto JSON.
    *   Retorno del objeto JSON del candidato.
*   **Pruebas:**
    *   Pruebas unitarias con Jest para controlador y servicio.

## 3. Integración

*   El `CandidateService` (frontend) envía POST a `/candidates` (backend).
*   El backend procesa, combina datos y responde con JSON.
*   El `CandidateService` (frontend) recibe respuesta y la pasa a `CandidateDataService`.
*   El `CandidateListComponent` (frontend) actualiza la tabla.

## Diagrama de Flujo de Datos

```mermaid
graph TD
    A[Usuario] --> B(Frontend Angular);
    B --> C{CandidateFormComponent};
    C --> D[Datos del Formulario + Archivo Excel];
    D --> E(CandidateService - Frontend);
    E --> F[Solicitud HTTP POST];
    F --> G(Backend NestJS);
    G --> H{CandidatesController};
    H --> I{CandidatesService - Backend};
    I --> J[Procesar Excel + Combinar Datos];
    J --> K[Objeto JSON del Candidato];
    K --> L[Respuesta HTTP];
    L --> E;
    E --> M(CandidateDataService - Frontend);
    M --> N[Almacenamiento Incremental];
    N --> O{CandidateListComponent};
    O --> P[Mostrar Tabla de Candidatos];