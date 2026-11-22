import { createQuery, keepPreviousData } from '@tanstack/svelte-query';
import { appService, dashboardService } from '#lib/services/index.ts';
import type { TrendRange } from '#lib/types/index.ts';
import { STALE } from './client';
import { queryKeys } from './keys';

export const createBusinessesQuery = () =>
	createQuery(() => ({
		queryKey: queryKeys.app.businesses,
		queryFn: appService.businesses,
		staleTime: STALE.reference
	}));

export const createMeQuery = () =>
	createQuery(() => ({ queryKey: queryKeys.app.me, queryFn: appService.me, staleTime: STALE.reference }));

export const createSummaryQuery = (business: () => string | undefined) =>
	createQuery(() => ({
		queryKey: queryKeys.dashboard.summary(business()),
		queryFn: () => dashboardService.summary(business())
	}));

export const createTrendQuery = (range: () => TrendRange, business: () => string | undefined) =>
	createQuery(() => ({
		queryKey: queryKeys.dashboard.trend(range(), business()),
		queryFn: () => dashboardService.trend(range(), business()),
		placeholderData: keepPreviousData
	}));

export const createActivitiesQuery = () =>
	createQuery(() => ({ queryKey: queryKeys.dashboard.activities, queryFn: dashboardService.activities }));

export const createOutstandingQuery = () =>
	createQuery(() => ({ queryKey: queryKeys.dashboard.outstanding, queryFn: dashboardService.outstanding }));

export const createUpcomingQuery = () =>
	createQuery(() => ({ queryKey: queryKeys.dashboard.upcoming, queryFn: dashboardService.upcoming }));

export const createAttentionQuery = () =>
	createQuery(() => ({ queryKey: queryKeys.dashboard.attention, queryFn: dashboardService.attention }));
