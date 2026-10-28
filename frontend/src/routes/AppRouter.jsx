import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import PublicLayout from "../layouts/PublicLayout";
import AdminLayout from "../layouts/AdminLayout";
import ProtectedRoute from "./ProtectedRoute";
import { PageLoader } from "../components/ui/Spinner";
import Home from "../pages/Home";

const NotFound = lazy(() => import("../pages/NotFound"));
const Login = lazy(() => import("../pages/admin/Login"));
const Dashboard = lazy(() => import("../pages/admin/Dashboard"));
const Leads = lazy(() => import("../pages/admin/Leads"));
const LeadDetails = lazy(() => import("../pages/admin/LeadDetails"));
const Courses = lazy(() => import("../pages/admin/Courses"));
const Reviews = lazy(() => import("../pages/admin/Reviews"));
const PaymentResult = lazy(() => import("../pages/PaymentResult"));
const CourseAccess = lazy(() => import("../pages/CourseAccess"));
const GuestOrders = lazy(() => import("../pages/admin/GuestOrders"));

export default function AppRouter() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="payment/:status" element={<PaymentResult />} />
          <Route path="course-access/:token" element={<CourseAccess />} />
          <Route path="courses/:courseId" element={<Navigate to="/payment/cancel" replace />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route path="/admin/login" element={<Login />} />

        <Route path="/admin" element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="leads" element={<Leads />} />
            <Route path="leads/:id" element={<LeadDetails />} />
            <Route path="courses" element={<Courses />} />
            <Route path="reviews" element={<Reviews />} />
            <Route path="guest-orders" element={<GuestOrders />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}
