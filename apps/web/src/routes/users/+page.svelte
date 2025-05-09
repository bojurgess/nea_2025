<script lang="ts">
	import { Session } from "$lib/telemetry/session.svelte";
	import { quickSort } from "$lib/alg/sort";
	import type { PageProps } from "./$types";
	import { countryCodeToUnicode } from "$lib/util";
	import { goto } from "$app/navigation";

	let { data }: PageProps = $props();
	let users = data.users.map((user) => ({
		...user,
		joinDate: new Date(user.joinDate),
	}));

	$inspect(Array.isArray(users));

	quickSort(users, (a, b) => a.joinDate.getTime() - b.joinDate.getTime());
</script>

<table class="container-box border-collapse">
	<thead>
		<tr class="[&>*]:border [&>*]:p-2 [&>*]:font-bold">
			<th>#</th>
			<th>Country</th>
			<th>User</th>
			<th>Join Date</th>
		</tr>
	</thead>
	<tbody>
		{#each users as user, i (user.joinDate)}
			<tr
				onclick={() => goto(`/users/${user.id}`)}
				role="link"
				class="cursor-pointer [&>*]:w-fit [&>*]:border [&>*]:p-2 [&>*]:px-12"
			>
				<td>
					{i + 1}
				</td>
				<td>
					{countryCodeToUnicode(user.flag)}
				</td>
				<td>
					{user.username}
				</td>
				<td>{Session.formatDate(user.joinDate)}</td>
			</tr>
		{/each}
	</tbody>
</table>
