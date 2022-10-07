<?php

@include_once __DIR__ . '/vendor/autoload.php';

use Kirby\Data\Data;
use Kirby\Filesystem\F;
use Symfony\Component\VarDumper\VarDumper;
use Symfony\Component\VarDumper\Cloner\VarCloner;
use Symfony\Component\VarDumper\Dumper\HtmlDumper;
use Symfony\Component\VarDumper\Caster\ReflectionCaster;

function poop($var, $direct = false) {
    
    if ( $direct === true ) VarDumper::dump($var);

    $dumpsFile = kirby()->root('site').'/toilet/dumps.txt';

    $dumpString = (new HtmlDumper())->dump((new VarCloner)->cloneVar($var), true);

    $seperator = F::exists($dumpsFile) ? '|U+1F4A9|' : '';

    F::write($dumpsFile, $seperator . $dumpString, F::exists($dumpsFile));
 
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
                                return F::exists($file) ? explode('|U+1F4A9|', F::read($file)) : [];
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


