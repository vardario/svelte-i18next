<script lang="ts">
  let { step, busy, width, id, open = $bindable() } = $props();
  const setOpen = (value: boolean) => (open = value);
</script>

<Dialog bind:open={() => open, setOpen}>
  <ol class="steps {step > 1 ? 'done' : 'open'}" data-testid="row-{id}">
    <li style="width: {width}%">{$i18n('step')}</li>
  </ol>
  {#if step === 0}
    <p>{$i18n('file')}</p>
  {:else if step === 1}
    <p>{$i18n('mapping')}</p>
  {:else}
    <p>{$i18n('result')}</p>
    {#if busy}
      <p>{$i18n('busy')}</p>
    {/if}
  {/if}
</Dialog>
