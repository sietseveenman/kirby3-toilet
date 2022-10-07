<?php

use Symfony\Component\VarDumper\VarDumper;

Kirby::plugin('sietseveenman/kirby3-dump-clips', [

    'components' => [
        'dump' => function ($kirby, $variable, bool $echo = true) {
            VarDumper::dump($variable);
            return '';
        }
    ],

]);


