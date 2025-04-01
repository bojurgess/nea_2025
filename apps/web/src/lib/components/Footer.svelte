<script lang="ts">
	import { page } from "$app/state";

	let shouldBeFixed = page.error;
</script>

<footer
	class={`flex max-h-fit w-full justify-center border-t bg-white p-4 py-8 ${shouldBeFixed ? "fixed bottom-0" : "static"}`}
>
	<div
		class="flex max-w-6xl grow flex-col justify-around space-y-8 px-2 md:flex-row md:space-y-0"
	>
		<section class="flex md:block md:place-self-center">
			<h1 class="text-2xl">Telemetry</h1>
			<h1 class="text-2xl">🏎️</h1>
		</section>
		<div class="space-between flex flex-col gap-8 md:flex-row md:gap-16">
			<section class="text-left">
				<h1 class="text-2xl">Sitemap</h1>
				<menu
					class="[&>li>a]:underline [&>li>a]:[text-decoration-color:transparent] [&>li>a]:transition-all [&>li>a]:hover:[text-decoration-color:inherit]"
				>
					<li><a href="/">Home</a></li>
					<li><a href="/tracks">Tracks</a></li>
					<li><a href="/users">Users</a></li>
				</menu>
			</section>
			<section class="text-left">
				<h1 class="text-2xl">Project</h1>
				<menu class="grid gap-x-8 md:grid-cols-2">
					<li><a href="/">Analysis</a></li>
					<li><a href="/">Design</a></li>
					<li><a href="/">Technical Solution</a></li>
					<li><a href="/">Testing</a></li>
					<li><a href="/">Evaluation</a></li>
					<li>
						<a href="https://github.com/bojurgess/nea_2025">Repository</a>
					</li>
				</menu>
			</section>
		</div>
	</div>
</footer>
