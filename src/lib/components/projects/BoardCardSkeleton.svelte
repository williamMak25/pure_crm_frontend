<script lang="ts">
	import Skeleton from '../ui/skeleton/Skeleton.svelte';
</script>

<div class="flex h-[156px] flex-col rounded-lg border border-neutral-200 bg-white shadow-card" aria-hidden="true">
	<div class="border-b border-neutral-200 p-3"><Skeleton width="45%" height="18px" /></div>
	<div class="flex flex-col gap-2 border-b border-neutral-200 p-3">
		<div class="flex justify-between"><Skeleton width="55%" height="14px" /><Skeleton width="70px" height="22px" /></div>
		<Skeleton width="25%" height="14px" />
	</div>
	<div class="p-3"><Skeleton width="50%" height="14px" /></div>
</div>
