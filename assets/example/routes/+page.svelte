<script lang="ts">
  function $i18n(key: string, params?: any) {
    return key;
  }
  let title = $i18n('title');
  const def = [$i18n('item0'), $i18n('item1')];
</script>

<main>
  <section>
    {$i18n('intro')}
  </section>
  <section>
    {$i18n('known-from', { param: 'hello' })}
  </section>
  <section>{title}</section>
</main>
