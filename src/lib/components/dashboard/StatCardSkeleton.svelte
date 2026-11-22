<script lang="ts">
	import Skeleton from '../ui/skeleton/Skeleton.svelte';
</script>

<div class="flex h-[118px] items-center gap-3 rounded-xl bg-white p-5 shadow-card" aria-hidden="true">
	<Skeleton width="50px" height="50px" rounded="full" />
	<div class="flex flex-1 flex-col gap-2">
		<Skeleton width="60%" height="14px" />
		<Skeleton width="45%" height="22px" />
		<Skeleton width="70%" height="12px" />
	</div>
</div>
