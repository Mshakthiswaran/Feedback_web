# Frontend Setup
cd g:\feedback
npx.cmd -y create-vite@latest frontend --template react
cd frontend
npm.cmd install
npm.cmd install react-router-dom lucide-react recharts qrcode.react axios zustand clsx tailwind-merge
npm.cmd install -D tailwindcss postcss autoprefixer
npx.cmd tailwindcss init -p

# Frontend Structure
New-Item -ItemType Directory -Force src/assets/images, src/assets/icons, src/components/common, src/components/layout, src/components/professor, src/components/dashboard, src/components/student, src/pages/auth, src/pages/professor, src/pages/student, src/pages/admin, src/routes, src/context, src/hooks, src/services, src/store/slices, src/utils, src/styles

New-Item -ItemType File src/components/common/Button.jsx, src/components/common/Input.jsx, src/components/common/Dropdown.jsx, src/components/common/Modal.jsx, src/components/common/Loader.jsx, src/components/common/Toast.jsx, src/components/common/Badge.jsx, src/components/common/Tooltip.jsx -Force
New-Item -ItemType File src/components/layout/Navbar.jsx, src/components/layout/Sidebar.jsx, src/components/layout/Footer.jsx, src/components/layout/PageWrapper.jsx -Force
New-Item -ItemType File src/components/professor/FormBuilder.jsx, src/components/professor/ColumnManager.jsx, src/components/professor/RowManager.jsx, src/components/professor/ShareableLink.jsx, src/components/professor/QRCodeDisplay.jsx, src/components/professor/FormCard.jsx, src/components/professor/FormSettings.jsx -Force
New-Item -ItemType File src/components/dashboard/SummaryCards.jsx, src/components/dashboard/BarChart.jsx, src/components/dashboard/DonutChart.jsx, src/components/dashboard/ComparisonChart.jsx, src/components/dashboard/TrendGraph.jsx, src/components/dashboard/ResultsTable.jsx, src/components/dashboard/LowRatingAlert.jsx, src/components/dashboard/ExportButtons.jsx -Force
New-Item -ItemType File src/components/student/FeedbackTable.jsx, src/components/student/CriteriaRow.jsx, src/components/student/SubjectColumn.jsx, src/components/student/RatingDropdown.jsx, src/components/student/ReviewTable.jsx, src/components/student/ThankYou.jsx -Force
New-Item -ItemType File src/pages/auth/Login.jsx, src/pages/auth/Register.jsx -Force
New-Item -ItemType File src/pages/professor/Dashboard.jsx, src/pages/professor/MyForms.jsx, src/pages/professor/CreateForm.jsx, src/pages/professor/EditForm.jsx, src/pages/professor/FormResults.jsx, src/pages/professor/Profile.jsx -Force
New-Item -ItemType File src/pages/student/FeedbackForm.jsx, src/pages/student/ReviewPage.jsx, src/pages/student/PinEntry.jsx, src/pages/student/ThankYouPage.jsx -Force
New-Item -ItemType File src/pages/admin/AdminDashboard.jsx, src/pages/admin/ManageProfessors.jsx, src/pages/admin/ManageForms.jsx -Force
New-Item -ItemType File src/pages/NotFound.jsx, src/routes/AppRoutes.jsx, src/routes/ProtectedRoute.jsx, src/routes/PublicRoute.jsx, src/context/AuthContext.jsx, src/context/ThemeContext.jsx, src/hooks/useAuth.js, src/hooks/useForm.js, src/hooks/useFeedback.js, src/hooks/useExport.js, src/services/api.js, src/services/authService.js, src/services/formService.js, src/services/submissionService.js, src/services/exportService.js, src/store/index.js, src/store/slices/authSlice.js, src/store/slices/formSlice.js, src/store/slices/submissionSlice.js, src/utils/constants.js, src/utils/helpers.js, src/utils/validators.js, src/utils/formatters.js, src/styles/index.css, src/styles/globals.css -Force

# Backend Structure
cd ../backend

New-Item -ItemType Directory -Force config, models, controllers, routes, middleware, services, validations, utils

New-Item -ItemType File server.js, config/db.js, config/jwt.js, config/multer.js, models/Professor.model.js, models/FeedbackForm.model.js, models/Submission.model.js, controllers/auth.controller.js, controllers/form.controller.js, controllers/submission.controller.js, controllers/export.controller.js, controllers/admin.controller.js, routes/auth.routes.js, routes/form.routes.js, routes/submission.routes.js, routes/export.routes.js, routes/admin.routes.js, middleware/auth.middleware.js, middleware/admin.middleware.js, middleware/validate.middleware.js, middleware/errorHandler.middleware.js, services/email.service.js, services/excel.service.js, services/pdf.service.js, services/qrcode.service.js, validations/auth.validation.js, validations/form.validation.js, validations/submission.validation.js, utils/constants.js, utils/helpers.js, utils/logger.js -Force
