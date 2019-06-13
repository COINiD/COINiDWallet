# Code taken from fastlane snapshot and modified to work with detox screens

require 'erb'
require 'fastimage'
require 'fileutils'
require 'json'

def screens_path
  File.join('screenshots')
end

def artifacts_path
  File.join('artifacts')
end

def prepare_dirs
  lang_dir = File.join(screens_path, 'en')
  FileUtils.rm_r(lang_dir) if File.directory?(lang_dir)
  FileUtils.mkdir_p(lang_dir) unless File.directory?(lang_dir)
end

def move_from_artifacts
  Dir[File.join(artifacts_path, "*")].sort.each do |test_run_folder|
    test_run = File.basename(test_run_folder)
    device_key = test_run.split('.')[0..-2].join('.')
    puts device_key

    Dir[File.join(test_run_folder, '**', '*.png')].sort.each do |png_file_path|
      png_file = png_file_path.split('/')[-1]
      png_name = png_file.split('.')[0]
      new_file_name = "#{device_key}-#{png_name}.png"

      source_file = File.join(png_file_path)
      dest_file = File.join(screens_path, 'en', new_file_name)

      FileUtils.copy_file(source_file, dest_file)
    end
  end
end

def generate
  puts("Generating HTML Report")
  puts screens_path

  @data_by_language = {}
  @data_by_screen = {}

  puts File.join(screens_path, "*")

  Dir[File.join(screens_path, "*")].sort.each do |language_folder|
    language = File.basename(language_folder)
    puts "Language #{language}"

    Dir[File.join(language_folder, '*.png')].sort.each do |screenshot|
      file_name = File.basename(screenshot)

      available_devices.each do |key_name, output_name|
        next unless file_name.include?(key_name)

        @data_by_language[language] ||= {}
        @data_by_language[language][output_name] ||= []

        screen_name = file_name.sub(key_name + '-', '').sub('.png', '')
        puts "Screen #{screen_name}"
        @data_by_screen[screen_name] ||= {}
        @data_by_screen[screen_name][output_name] ||= {}

        resulting_path = File.join('.', language, file_name)
        puts "Path #{resulting_path}"
        @data_by_language[language][output_name] << resulting_path
        @data_by_screen[screen_name][output_name][language] = resulting_path
        break
      end
    end
  end

  html_path = File.join("#{File.dirname(__FILE__)}/page.html.erb")
  html = ERB.new(File.read(html_path)).result(binding) # https://web.archive.org/web/20160430190141/www.rrn.dk/rubys-erb-templating-system

  export_path = "#{screens_path}/index.html"
  File.write(export_path, html)

  export_path = File.expand_path(export_path)
  puts("Successfully created HTML file with an overview of all the screenshots: '#{export_path}'")
  system("open '#{export_path}'")
end

def available_devices
  json_string = File.read('package.json')
  json = JSON.parse(json_string)
  devices = {}
  json['detox']['configurations'].each do |key, value|
    devices[key] = value['name']
  end
  devices
end

prepare_dirs()
move_from_artifacts()
generate()
