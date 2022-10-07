<?php

use Symfony\Component\VarDumper\VarDumper;

Kirby::plugin('sietseveenman/kirby3-dump-clips', [

    'components' => [
        'dump' => function ($kirby, $variable, bool $echo = true) {
            VarDumper::dump($variable);
            return '';
        }
    ],

    'areas' => [
        'dump-clips' => [
            'label'   => 'Dumps',
            'icon'    => 'image',
            'menu'    => true,
            'views'   => [[
                'pattern' => 'dumps',
                'action'  => function () {
                    return [
                        'component' => 'dump-clips',
                        'props' => [
                            'headline' => function ($headline = 'Dump clips') {
                                return $headline;
                            },
                        ]
                    ];
                }
            ],],
        ],
    ],

]);


