<?php

@include_once __DIR__ . '/vendor/autoload.php';

use Kirby\Data\Data;
use Kirby\Filesystem\F;
use kirby\Data\Json;
use Symfony\Component\VarDumper\VarDumper;
use Symfony\Component\VarDumper\Cloner\VarCloner;
use Symfony\Component\VarDumper\Dumper\HtmlDumper;
use Symfony\Component\VarDumper\Caster\ReflectionCaster;

function poop(
    mixed $var, 
    string $label = '',
    bool $direct = false,
    bool $trace = true,
): mixed {
    
    if ( $direct === true ) VarDumper::dump($var);

    $dumpsFile = kirby()->root('site').'/toilet/dumps.txt';

    $dumper = new HtmlDumper();
    $dumper->setTheme('light');
    $dumpString = $dumper->dump((new VarCloner)->cloneVar($var), true);
    
    $timestamp = time();
    $dt = new DateTime("now", new DateTimeZone('Europe/Amsterdam')); //first argument "must" be a string
    $dt->setTimestamp($timestamp); //adjust the object to correct timestamp

    $dump = [
        'dump' => $dumpString,
        'timestamp' => $dt->format('H:i:s'),
        'label' => $label,
        'trace' => null
    ];

    if( $trace ) {
        $bt = debug_backtrace();
        $caller = array_shift($bt);
        $dump['trace'] = $caller;
    }

    // VarDumper::dump($dump);

    $seperator = F::exists($dumpsFile) ? '|U+1F4A9|' : '';

    F::write($dumpsFile, $seperator . Json::encode($dump), F::exists($dumpsFile));
 
    return $var;
}

Kirby::plugin('sietseveenman/kirby3-toilet', [
    'areas' => [
        'toilet' => [
            'label'   => 'Toilet',
            'icon'    => 'smile',
            'menu'    => true,
            'views'   => [[
                'pattern' => 'toilet',
                'action'  => function () {
                    return [
                        'component' => 'toilet',
                        'title' => 'Toilet',
                        'props' => [
                            'dumps' => function() {
                                $file = kirby()->root('site').'/toilet/dumps.txt';
                                return array_reverse( F::exists($file) ? explode('|U+1F4A9|', F::read($file)) : []);
                            },
                            'headline' => function ($headline = "Number two's") {
                                return $headline;
                            },
                        ]
                    ];
                }
            ],],
        ],
    ],

]);


