<?php

use Symfony\Component\VarDumper\VarDumper;

Kirby::plugin('sietseveenman/kirby3-toilet', [

    'components' => [
        'dump' => function ($kirby, $variable, bool $echo = true) {
            VarDumper::dump($variable);
            return '';
        }
    ],

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


