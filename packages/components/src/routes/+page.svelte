<script lang="ts">
	import Select from "$lib/Select.svelte";

	let selectedTelemetryLap: string | undefined = $state();
	let selectOptions = ["Lap 1", "Lap 2", "Lap 3", "Lap 4", "Lap 5"];
</script>

<h1>Welcome to your library project</h1>
<p>Create your package using @sveltejs/package and preview/showcase your work with SvelteKit</p>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>
<Select title="Lap" bind:value={selectedTelemetryLap} options={selectOptions} />
