<script lang="ts">
	let isRegisterForm: boolean = $state(false);

	const formatDisplayString = (input: string): string => {
		const substrings = input.split(/(?=[A-Z])/);
		return substrings
			.map((str) => {
				return str[0].toUpperCase() + str.slice(1);
			})
			.join(" ");
	};
</script>

{#snippet formInput(type: "text" | "password", name: string)}
	<label class="flex flex-col">
		<span class="font-semibold">{formatDisplayString(name)}</span>
		<input
			required
			class="border-black transition-all focus:border-black focus:outline-0 focus:ring-black"
			{type}
			{name}
		/>
	</label>
{/snippet}

{#snippet authForm(type: "register" | "login")}
	<form method="POST" action="?/{type}" class="flex max-w-md flex-col items-center space-y-8 p-4">
		<h1 class="text-2xl font-bold">{formatDisplayString(type)}</h1>
		<div class="flex w-full flex-col">
			{@render formInput("text", "username")}
			{@render formInput("password", "password")}

			{#if type === "register"}
				{@render formInput("password", "confirmPassword")}
			{/if}
		</div>

		<button
			type="submit"
			class="border border-black p-2 px-8 transition-all hover:translate-y-1 focus:translate-y-1"
			>{type[0].toUpperCase() + type.slice(1)}</button
		>

		{#if type === "register"}
			<span
				>Already a user? <button
					onclick={() => (isRegisterForm = false)}
					type="button"
					class="font-semibold underline">Sign in</button
				></span
			>
		{:else}
			<span
				>Not a user? <button
					onclick={() => (isRegisterForm = true)}
					type="button"
					class="font-semibold underline">Register</button
				></span
			>
		{/if}
	</form>
{/snippet}

{#if isRegisterForm}
	{@render authForm("register")}
{:else}
	{@render authForm("login")}
{/if}

<style>
	*:focus {
		outline: none;
	}

	form > button[type="submit"] {
		box-shadow: 5px 5px #000;
	}

	form > button[type="submit"]:hover {
		box-shadow: none;
	}

	form > button[type="submit"]:focus {
		box-shadow: none;
	}
</style>
