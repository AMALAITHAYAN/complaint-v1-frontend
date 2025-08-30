import React from 'react'
import {
  createRootRoute, createRoute, createRouter, RouterProvider, Outlet,
} from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/shared/providers/AuthProvider'
import LoginPage from '@/shared/pages/LoginPage'

import AdminLayout from '@/admin/layouts/AdminLayout'
import AdminDashboard from '@/admin/pages/AdminDashboard'
import DocumentTypesPage from '@/admin/pages/DocumentTypesPage'
import DocumentTypesRestorePage from '@/admin/pages/DocumentTypesRestorePage'
import BatchesPage from '@/admin/pages/BatchesPage'
import UsersAccessPage from '@/admin/pages/UsersAccessPage' // ✅ NEW

import ScannerDashboard from '@/shared/pages/ScannerDashboard'
import ReviewerDashboard from '@/shared/pages/ReviewerDashboard'
import ViewerDashboard from '@/shared/pages/ViewerDashboard'

const queryClient = new QueryClient()

const rootRoute = createRootRoute({
  component: () => (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="min-h-screen bg-white text-gray-900">
          <Outlet />
        </div>
      </AuthProvider>
    </QueryClientProvider>
  ),
})

/** Base URL → Login */
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LoginPage,
})

/** Admin parent with sidebar layout */
const adminRootRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminLayout,
})

/** Admin children */
const adminIndexRoute = createRoute({
  getParentRoute: () => adminRootRoute,
  path: '/', // /admin
  component: AdminDashboard,
})

const adminDocTypesRoute = createRoute({
  getParentRoute: () => adminRootRoute,
  path: '/document-types', // /admin/document-types
  component: DocumentTypesPage,
})

const adminDocTypesRestoreRoute = createRoute({
  getParentRoute: () => adminRootRoute,
  path: '/document-types/restore', // /admin/document-types/restore
  component: DocumentTypesRestorePage,
})

const adminBatchesRoute = createRoute({
  getParentRoute: () => adminRootRoute,
  path: '/batches', // /admin/batches
  component: BatchesPage,
})

/** ✅ New: Users Access */
const adminUsersAccessRoute = createRoute({
  getParentRoute: () => adminRootRoute,
  path: '/users-access', // /admin/users-access
  component: UsersAccessPage,
})

/** Other role landing pages */
const scannerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/scanner',
  component: ScannerDashboard,
})
const reviewerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reviewer',
  component: ReviewerDashboard,
})
const viewerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/viewer',
  component: ViewerDashboard,
})

/** Route tree */
const routeTree = rootRoute.addChildren([
  loginRoute,
  adminRootRoute.addChildren([
    adminIndexRoute,
    adminDocTypesRoute,
    adminDocTypesRestoreRoute,
    adminBatchesRoute,
    adminUsersAccessRoute, // ✅ added Users Access tab
  ]),
  scannerRoute,
  reviewerRoute,
  viewerRoute,
])

const router = createRouter({ routeTree })
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

export default function AppRouter() {
  return <RouterProvider router={router} />
}
