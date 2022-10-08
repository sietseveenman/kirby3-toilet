<?php

@include_once __DIR__ . '/vendor/autoload.php';

use Kirby\Data\Data;
use Kirby\Filesystem\F;
use kirby\Data\Json;
use Kirby\Cms\Response;
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

    $timestamp = time();
    $dt = new DateTime("now", new DateTimeZone('Europe/Amsterdam'));
    $dt->setTimestamp($timestamp);

    $dumpFile = kirby()->root('site').'/toilet/dump-'.$timestamp.'.txt';
    
    $dumper = new HtmlDumper();
    $dumper->setTheme('light');
    $fecal_matter = $dumper->dump((new VarCloner)->cloneVar($var), true);
    
    $dump = [
        'fecal_matter' => $fecal_matter,
        'timestamp' => $timestamp,
        'time' => $dt->format('H:i:s'),
        'label' => $label,
        'trace' => null
    ];

    if( $trace ) {
        $bt = debug_backtrace();
        $caller = array_shift($bt);
        $dump['trace'] = $caller;
    }

    // $dumpFileExists = F::exists($dumpFile);
    // $seperator = $dumpFileExists
    //     ? '|U+1F4A9|' 
    //     : '';
    // F::write($dumpFile, $seperator.Json::encode($dump), $dumpFileExists);

    F::write($dumpFile, Json::encode($dump));
 
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
                                $toilet = kirby()->root('site').'/toilet';
                                $dumpFiles = Dir::files($toilet);
                                $dumps = array_map(fn($file) => file_get_contents($toilet.'/'.$file), $dumpFiles);
                                return $dumps;
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
    'api' => [
        'routes' => [
            [
                'pattern' => 'remove-dump/(:num)',
                'method' => 'POST',
                'action'  => function (string $timestamp = null) {

                    if ( !$timestamp ) {
                        return Response::json([
                            'success'=> false, 
                            'message' => 'No timestamp provided'
                        ], 400);
                    }

                    try {
                        F::remove(  kirby()->root('site').'/toilet/dump-'.$timestamp.'.txt' );
                    } 
                    catch (\Throwable $th) {
                        return Response::json([
                            'success'=> false,
                            'message'=> $th->getMessage()
                        ], 500);
                    }
                    
                    return Response::json([
                        'success'=> true,
                        'message'=> 'Dump with timestamp: ' .$timestamp. ' has been removed'
                    ], 200);
                }
            ],
        ]
    ]
]);


