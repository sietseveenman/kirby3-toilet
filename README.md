# Kirby3 Toilet

Dump without stopping your thread or template rendering. Instead your dumps will go straight to the new Toilet panel area. There you can inspect them and flush when you are done debugging. Don't forget to wash your hands!

![number-two](https://user-images.githubusercontent.com/19320817/194783072-59ff2c15-87c4-4338-bf2c-6570bbb9e5c8.gif)

## Notes
This project was inspired by <a href="https://spatie.be/products/ray">Spatie's Ray</a> and <a href="https://laravel.com/docs/9.x/telescope">Laravel's Telescope</a>. It borrows some of Telescope's code to trigger the interactive bits of the dumps on the panel area.

🚧 Warning: This project was created in a couple of days, It hasn't been tested much. Use at your own risk!
## Installation

With Composer

```
composer require sietseveenman/kirby3-toilet
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

poop($payment)->isSuccessful()->doStuff();
```

### Config
```php
// site/config.php
return [
    'sietseveenman.kirby3-toilet' => [
        // Customize the timeout duration for loading fresh dumps.
        // Default = 2000
        'poop-timeout' => 500,
        // Dump in silence if you want to.
        // Default = false
        'muted' => true,
        // Set permission for user roles to use the toilet.
        // Default = ['admin']
        'roles' => ['developer', 'vegan'],
    ],
];
```