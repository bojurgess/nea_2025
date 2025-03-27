<script lang="ts">
	import { type ComponentProps, getters } from "melt";
	import { Select, type SelectProps } from "melt/builders";

	import ChevronDown from "@lucide/svelte/icons/chevron-down";
	import Timer from "@lucide/svelte/icons/timer";
	import Check from "@lucide/svelte/icons/check";

	type Props = ComponentProps<SelectProps<string, false>> & {
		title: string;
		options: [string, string][];
		onChange?: (v: string | undefined) => void;
		class?: string | undefined;
	};
	let {
		value = $bindable(),
		onChange = (v) => (value = v),
		options,
		title,
		class: selectClass,
		...rest
	}: Props = $props();

	type Option = (typeof options)[number];

	const select = new Select<Option[0]>({
		value: () => value,
		onValueChange: onChange,
		...getters(rest),
	});

	// check title for vowel beginning to correctly format tooltip
	const getTooltip = () => {
		return title.match(/^[aeiou]/gi) === null
			? `Select a ${title.toLowerCase()}`
			: `Select an ${title.toLowerCase()}`;
	};
</script>

<div class={["mx-auto flex w-[300px] flex-col gap-1", selectClass]}>
	<label for={select.ids.trigger}>{title}</label>
	<button
		{...select.trigger}
		class="textblack button-box flex items-center justify-between overflow-hidden py-2 pr-4 pl-3 text-black
				transition hover:cursor-pointer
				disabled:cursor-not-allowed"
	>
		<div class="inline-flex items-center gap-2 overflow-hidden">
			<Timer class="shrink-0" />
			<span class="truncate">{select.value ?? getTooltip()}</span>
		</div>
		<ChevronDown />
	</button>

	<div {...select.content} class="flex flex-col border border-black bg-white shadow">
		{#each options as option}
			<div
				{...select.getOption(option[0])}
				class={[
					"relative flex items-center justify-between py-2 pr-2 pl-8",
					select.highlighted === option[0] &&
						"bg-neutral-100 outline-1 outline-neutral-200",
					select.value === option[0] && "font-semibold",
				]}
			>
				<span>{option[0]}</span>
				<div class="inline-flex space-x-2">
					<span class="text-left">{option[1]}</span>
					<Check
						class={`font-bold ${select.isSelected(option[0]) ? "visible" : "invisible"}`}
					/>
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	[data-melt-select-content] {
		position: absolute;
		pointer-events: none;
		opacity: 0;

		transform: scale(0.975);

		transition: 0.2s;
		transition-property: opacity, transform;
		transform-origin: var(--melt-popover-content-transform-origin, center);
	}

	[data-melt-select-content][data-open] {
		pointer-events: auto;
		opacity: 1;

		transform: scale(1);
	}
</style>
