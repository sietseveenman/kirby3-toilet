<?php

@include_once __DIR__ . '/vendor/autoload.php';

use Kirby\Filesystem\F;
use kirby\Data\Json;
use Kirby\Cms\Response;
use Kirby\Cms\PluginAssets;
use Symfony\Component\VarDumper\VarDumper;
use Symfony\Component\VarDumper\Cloner\VarCloner;
use Symfony\Component\VarDumper\Dumper\HtmlDumper;

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

    $toilet = kirby()->root('site').'/toilet';

    $dumpFile = $toilet .'/fresh-dump-x'.$timestamp.'x.txt';
    
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

    // TODO: If there are more than XXX files, remove the oldest file
    // $dumpFiles = Dir::files($toilet);

    F::write($dumpFile, Json::encode($dump));
 
    return $var;
}

Kirby::plugin('sietseveenman/kirby3-toilet', [
    'options' => [
        'poop-timeout' => 2000,
        'roles' => ['admin']
    ],
    'areas' => [
        'toilet' => function() {

            $userRole = kirby()->user()?->role()->name();
            $allowedRoles = option('sietseveenman.kirby3-toilet.roles');
            
            if ( ! in_array($userRole, $allowedRoles) ) return [];

            return [
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
                                'audio' => function () {
                                    // PluginAssets::resolve('sietseveenman/kirby3-toilet', 'flush.mp3');
                                    // PluginAssets::resolve('sietseveenman/kirby3-toilet', 'fart-1.mp3');
                                    // PluginAssets::resolve('sietseveenman/kirby3-toilet', 'fart-2.mp3');
                                    // PluginAssets::resolve('sietseveenman/kirby3-toilet', 'fart-3.mp3');
                                    // PluginAssets::resolve('sietseveenman/kirby3-toilet', 'fart-4.mp3');
                                    // PluginAssets::resolve('sietseveenman/kirby3-toilet', 'fart-5.mp3');
                                    // PluginAssets::resolve('sietseveenman/kirby3-toilet', 'fart-6.mp3');
                                    return '';
                                },
                                'headline' => function ($headline = "Number two's") {
                                    return $headline;
                                },
                                'timeout' => function () {
                                    return option('sietseveenman.kirby3-toilet.poop-timeout');
                                },
                            ]
                        ];
                    }
                ],],
            ];
        }
    ],
    'api' => [
        'routes' => [
            [
                'pattern' => 'flush',
                'method' => 'POST',
                'action'  => function () {

                    $toilet = kirby()->root('site').'/toilet';
                    $dumpFiles = Dir::files($toilet);

                    try {
                        foreach ($dumpFiles as $file) {
                            F::remove($toilet.'/'.$file );
                        }
                    }
                    
                    catch (\Throwable $th) {
                        return Response::json([
                            'success'=> false,
                            'message'=> $th->getMessage()
                        ], 500);
                    }

                    return Response::json([
                        'success'=> true,
                        'message'=> 'Flushed'
                    ], 200);
                }
            ],
            [
                'pattern' => 'remove-dump/(:num)',
                'method' => 'POST',
                'action'  => function (string $timestamp = null) {

                    $toilet = kirby()->root('site').'/toilet';

                    if ( !$timestamp ) {
                        return Response::json([
                            'success'=> false, 
                            'message' => 'No timestamp provided'
                        ], 400);
                    }

                    try {
                        F::remove( $toilet.'/dump-x'.$timestamp.'x.txt' );
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
            [
                'pattern' => 'receive-fresh-dumps',
                'method' => 'GET',
                'action'  => function () {

                    $is_initial_dump = get('initial');
                   
                    $toilet = kirby()->root('site').'/toilet';
                    $dumpFiles = Dir::files($toilet);
                    $dumps = [];
            
                    if( !$is_initial_dump ) {

                        // Get fresh dumps
                        $fresh_dumps = array_filter( $dumpFiles, fn($d) => str_contains($d, 'fresh') );
    
                        foreach ($fresh_dumps as $dumpFile) {
                            array_push($dumps, file_get_contents($toilet.'/'.$dumpFile));
                            
                            $name = F::name($toilet.'/'.$dumpFile);
                            F::rename($toilet.'/'.$dumpFile, str_replace('fresh-', '', $name), true);
                        }
                    } 
                    else {
                        $dumps =  array_map( fn($file) => file_get_contents($toilet.'/'.$file), $dumpFiles );
                    }

                    return Response::json([
                        'success'=> true,
                        'dumps' => $dumps,
                        'message'=> count($dumps) > 0 
                            ? count($dumps).' new dumps received' 
                            : 'No new dumps',
                    ], 200);
                }
            ],
        ]
    ]
]);


