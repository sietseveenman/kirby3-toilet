# Kirby3 Toilet

Dump without stopping your thread or template rendering. Instead your dumps will go straight to the new Toilet panel area. There you can inspect them and flush when you are done debugging. Don't forget to wash your hands!

****

## Installation

With Composer

```
$ composer require sietseveenman/kirby3-toilet
```

### Usage

Use the poop() method anywhere.
```php
$articles = $page->children();

poop( $articles );
```
poop() returns the passed variable so you can chain methods and keep your code running.
```php
foreach( poop($articles), $item) {
    <a href="<?= $item->url() ?>"><?= $item->title() ?></a>
}
-------
poop($payment)->isSuccessful()->doStuff();
```

### Config
```php
// site/config.php
return [
    // Customize the timeout duration for loading fresh dumps.
    // Default = 2000
    'sietseveenman.kirby3-toilet.poop-timeout' => 500,
    // Set permission for user roles to use the toilet.
    // Default = ['admin']
    'sietseveenman.kirby3-toilet.roles' => ['developer', 'vegan'],
];
```

### Additional info
...
